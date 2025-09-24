import { ethers } from 'ethers';
import { wrap } from '@oasisprotocol/sapphire-paratime';
// import shapeshifterArtifact from '../artifacts/contracts/IdentityShapeshifter.sol/IdentityShapeshifter.json';
import shapeshifterArtifact from './artifacts.js';

export const SAPPHIRE_TESTNET_ID = 23295; // 0x5AFF
export const SAPPHIRE_MAINNET_ID = 23294; // 0x5AFE
export const isSapphireChain = (chainId) => chainId === SAPPHIRE_TESTNET_ID || chainId === SAPPHIRE_MAINNET_ID;

export const getProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getNetwork = async () => {
  const provider = getProvider();
  if (!provider) return null;
  return provider.getNetwork();
};

export const getChainIdSafe = async () => {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const net = await provider.getNetwork();
    if (typeof net?.chainId === 'number') return net.chainId;
  } catch {}
  try {
    const hex = await provider.send('eth_chainId', []);
    return parseInt(hex, 16);
  } catch {}
  return null;
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) return null;
  const signer = provider.getSigner();
  try {
    const chainId = await getChainIdSafe();
    // Only wrap on Sapphire chains to avoid oasis_callDataPublicKey on other networks
    if (isSapphireChain(chainId)) return wrap(signer);
  } catch {}
  return signer;
};

export const getShapeshifter = async (address) => {
  const provider = getProvider();
  const signer = await getSigner();
  if (!provider || !signer || !address) return null;
  return new ethers.Contract(address, shapeshifterArtifact.abi, signer);
};

export const getERC20 = async (address) => {
  const signer = await getSigner();
  if (!signer || !address) return null;
  const erc20Abi = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ];
  return new ethers.Contract(address, erc20Abi, signer);
};
