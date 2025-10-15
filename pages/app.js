import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import PersonaList from '../components/PersonaList';
import SwapForm from '../components/SwapForm';
import TradeHistory from '../components/TradeHistory';
import { getProvider, getShapeshifter, getERC20, getNetwork, getChainIdSafe } from '../lib/contract';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [personas, setPersonas] = useState([]);
  const [activePersonaId, setActivePersonaId] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [trades, setTrades] = useState([]);
  const [status, setStatus] = useState('');
  const [isSimMode, setIsSimMode] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [contractHealthMsg, setContractHealthMsg] = useState('');

  // Demo token address map (replace with real Sapphire addresses)
  const tokenMap = useMemo(() => ({
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // placeholder for native
    DAI: process.env.NEXT_PUBLIC_DAI || '0x0000000000000000000000000000000000000001',
    USDC: process.env.NEXT_PUBLIC_USDC || '0x0000000000000000000000000000000000000002',
    WBTC: process.env.NEXT_PUBLIC_WBTC || '0x0000000000000000000000000000000000000003',
    UNI: process.env.NEXT_PUBLIC_UNI || '0x0000000000000000000000000000000000000004',
  }), []);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return;
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = getProvider();
      const signerAddr = await provider.getSigner().getAddress();
      setAccount(signerAddr);
      let cid = null;
      try {
        cid = await getChainIdSafe();
        setChainId(Number(cid ?? 0));
      } catch {}
      const addr = process.env.NEXT_PUBLIC_SHAPESHIFTER_ADDR || '';
      setContractAddress(addr);

      const onSapphire = [23294, 23295].includes(Number(cid));
      const onLocalhost = Number(cid) === 31337;
      if (!onSapphire && !onLocalhost) return;

      if (addr) {
        try {
          const code = await provider.getCode(addr);
          if (!code || code === '0x') {
            setContractHealthMsg(`No contract found at ${addr} on chain ${Number(cid)}. Deploy first or clear NEXT_PUBLIC_SHAPESHIFTER_ADDR to use simulation.`);
            return;
          }
        } catch (e) {
          setContractHealthMsg('Failed to fetch contract code. Check RPC and address.');
          return;
        }
        const c = await getShapeshifter(addr);
        if (!c) return;
        setContract(c);
        try {
          const router = await c.swapRouter();
          setIsSimMode(router === '0x0000000000000000000000000000000000000000');
        } catch (e) {
          // If read fails, mark health message and skip further calls
          setContractHealthMsg('Contract read failed. Ensure ABI/address match this deployment.');
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!contract || contractHealthMsg) return;
    const fetchPersonas = async () => {
      try {
        const ids = await contract.getIdentityIds();
        const active = await contract.getActiveIdentity();
        setActivePersonaId(active);
        const items = await Promise.all(ids.map(async (id) => {
          const [name] = await contract.getIdentity(id);
          return { id, name };
        }));
        setPersonas(items);
        const ap = items.find(p => p.id === active);
        setActivePersona(ap || null);
        if (ap) await refreshTrades(ap.id);
      } catch (e) {
        setContractHealthMsg('Unable to query personas. Verify the network and contract.');
      }
    };
    fetchPersonas();
  }, [contract, contractHealthMsg]);

  const refreshTrades = async (identityId) => {
    if (!contract || !identityId) return;
    try {
      const history = await contract.getSwapHistory(identityId);
      const uiTrades = history.map(h => ({
        inputToken: h.inputToken,
        outputToken: h.outputToken,
        amountIn: h.amountIn.toString(),
        amountOut: h.amountOut.toString(),
        timestamp: h.timestamp.toNumber(),
      }));
      setTrades(uiTrades);
    } catch {}
  };

  const onCreatePersona = async (name) => {
    if (!contract) return;
    setStatus('Creating persona…');
    const meta = new TextEncoder().encode('opaque');
    const tx = await contract.createIdentity(name, meta);
    await tx.wait();
    setStatus('');
    const ids = await contract.getIdentityIds();
    const active = await contract.getActiveIdentity();
    setActivePersonaId(active);
    const items = await Promise.all(ids.map(async (id) => {
      const [n] = await contract.getIdentity(id);
      return { id, name: n };
    }));
    setPersonas(items);
    const ap = items.find(p => p.id === active);
    setActivePersona(ap || null);
  };

  const onSwitchPersona = async (id) => {
    if (!contract) return;
    setStatus('Switching persona…');
    await (await contract.switchIdentity(id)).wait();
    setActivePersonaId(id);
    const p = personas.find(x => x.id === id);
    setActivePersona(p || null);
    await refreshTrades(id);
    setStatus('');
  };

  const onMidTradeSwitch = async (id) => {
    if (!contract) return;
    await (await contract.midTradeSwitch(id, true)).wait();
    setActivePersonaId(id);
    const p = personas.find(x => x.id === id);
    setActivePersona(p || null);
  };

  const onSwap = async ({ inputToken, outputToken, amount }) => {
    if (!contract || !activePersonaId) return;
    const inAddr = tokenMap[inputToken];
    const outAddr = tokenMap[outputToken];

    if (isSimMode) {
      // No approvals needed and we can assume 18 decimals for demo math
      setStatus('Swapping…');
      const amt = BigInt(Math.floor(amount * 1e18));
      const minOut = (amt * 98n) / 100n; // naive 2% slippage
      const tx = await contract.swapTokens(inAddr, outAddr, amt.toString(), minOut.toString());
      await tx.wait();
      setStatus('');
      await refreshTrades(activePersonaId);
      return;
    }

    // Real mode: require configured addresses and approvals
    if (!inAddr || !outAddr) {
      alert('Token addresses not configured');
      return;
    }

    setStatus('Approving…');
    const ercIn = await getERC20(inAddr);
    const decimals = await ercIn.decimals();
    const amt = BigInt(Math.floor(amount * 10 ** decimals));
    try {
      const tx1 = await ercIn.approve(contractAddress, amt.toString());
      await tx1.wait();
    } catch (e) {
      console.error(e);
    }
    setStatus('Swapping…');
    const minOut = (amt * 98n) / 100n; // naive 2% slippage
    const tx2 = await contract.swapTokens(inAddr, outAddr, amt.toString(), minOut.toString());
    await tx2.wait();
    setStatus('');
    await refreshTrades(activePersonaId);
  };

  const switchToSapphire = async (mainnet = false) => {
    const params = mainnet
      ? {
          chainId: '0x5afe', // 23294
          chainName: 'Oasis Sapphire',
          nativeCurrency: { name: 'ROSE', symbol: 'ROSE', decimals: 18 },
          rpcUrls: ['https://sapphire.oasis.io'],
          blockExplorerUrls: ['https://explorer.oasis.io/mainnet/sapphire']
        }
      : {
          chainId: '0x5aff', // 23295
          chainName: 'Oasis Sapphire Testnet',
          nativeCurrency: { name: 'ROSE', symbol: 'ROSE', decimals: 18 },
          rpcUrls: ['https://testnet.sapphire.oasis.dev'],
          blockExplorerUrls: ['https://explorer.oasis.io/testnet/sapphire']
        };
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: params.chainId }] });
    } catch (e) {
      if (e?.code === 4902) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [params] });
      } else {
        console.error(e);
      }
    }
  };

  return (
    <div>
      <Head>
        <title>ShadeSwap</title>
        <meta name="description" content="Privacy-first DEX with anonymous trading personas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 bg-neutral-950 border-b border-neutral-900">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white text-neutral-900 flex items-center justify-center font-black">SS</div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">ShadeSwap</h1>
            </div>
            <div className="flex items-center gap-4">
              {personas?.length > 0 && (
                <select
                  aria-label="Active persona"
                  value={activePersonaId || ''}
                  onChange={(e) => onSwitchPersona(e.target.value)}
                  className="input w-44"
                >
                  {personas.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              {account ? (
                <span className="chip" aria-label="Connected account">
                  {account.slice(0,6)}…{account.slice(-4)}
                </span>
              ) : (
                <button className="btn btn-primary" aria-label="Connect wallet" onClick={async ()=>{
                  await window.ethereum?.request({ method: 'eth_requestAccounts' });
                  location.reload();
                }}>Connect</button>
              )}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-8">
          {/* Network guard */}
          {chainId && ![23294,23295].includes(chainId) && (
            <div className="mb-6 text-sm text-amber-300/90 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3 flex items-center justify-between gap-3">
              <span>
                Detected chainId {chainId}. Switch to Oasis Sapphire (Testnet 23295 or Mainnet 23294) to enable confidential features.
              </span>
              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={() => switchToSapphire(false)}>Switch to Testnet</button>
                <button className="btn btn-ghost" onClick={() => switchToSapphire(true)}>Switch to Mainnet</button>
              </div>
            </div>
          )}

          {contractHealthMsg && (
            <div className="mb-6 text-sm text-amber-300/90 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
              {contractHealthMsg}
            </div>
          )}

          {!contractAddress && (
            <div className="mb-6 text-sm text-amber-300/90 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
              Set NEXT_PUBLIC_SHAPESHIFTER_ADDR in .env.local to enable on-chain actions.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <aside className="md:col-span-1 card">
              <div className="card-body">
                <PersonaList personas={personas} activePersona={activePersonaId} onSwitchPersona={onSwitchPersona} onCreatePersona={onCreatePersona} />
              </div>
            </aside>

            <div className="md:col-span-2 space-y-6">
              <SwapForm activePersona={activePersona} onSwap={onSwap} personas={personas} onMidTradeSwitch={onMidTradeSwitch} />
              <TradeHistory activePersona={activePersona} trades={trades} />
            </div>
          </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="mt-8 border-t border-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-white text-neutral-900 flex items-center justify-center font-black">SS</div>
              <span className="text-white font-semibold">ShadeSwap</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">Privacy-first trading with personas. Built on Oasis Sapphire & Uniswap.</p>
          </div>
          <div className="text-sm">
            <div className="text-gray-300 font-medium mb-2">Product</div>
            <ul className="space-y-1 text-gray-400">
              <li><a className="hover:text-white" href="/app">Open App</a></li>
              <li><a className="hover:text-white" href="#features">Features</a></li>
              <li><a className="hover:text-white" href="#how">How it works</a></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="text-gray-300 font-medium mb-2">Community</div>
            <ul className="space-y-1 text-gray-400">
              <li><a className="hover:text-white" href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a className="hover:text-white" href="https://discord.com" target="_blank" rel="noreferrer">Discord</a></li>
              <li><a className="hover:text-white" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 py-6 border-t border-neutral-900">© {new Date().getFullYear()} ShadeSwap</div>
      </footer>

      {/* Floating status toast */}
      {status && (
        <div role="status" aria-live="polite" className="toast">
          {status}
        </div>
      )}

    </div>
  );
}
