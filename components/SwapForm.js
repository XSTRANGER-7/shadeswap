import { useState } from 'react';

export default function SwapForm({ activePersona, onSwap, personas = [], onMidTradeSwitch }) {
  const [inputToken, setInputToken] = useState('ETH');
  const [outputToken, setOutputToken] = useState('DAI');
  const [amount, setAmount] = useState('');
  const [midSwitchId, setMidSwitchId] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  
  // Demo tokens for the prototype
  const tokens = ['ETH', 'DAI', 'USDC', 'WBTC', 'UNI'];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount && inputToken && outputToken) {
      setIsSwapping(true);
      try {
        // Optional mid-trade switch before executing swap
        if (midSwitchId && onMidTradeSwitch) {
          await onMidTradeSwitch(midSwitchId);
        }
        await onSwap({
          inputToken,
          outputToken,
          amount: parseFloat(amount)
        });
      } catch (error) {
        console.error('Swap failed:', error);
      } finally {
        setIsSwapping(false);
      }
    }
  };
  
  const handleTokenSwitch = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
  };

  return (
    <div className="card relative">
      {/* Loading overlay */}
      {isSwapping && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="bg-neutral-800/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-neutral-700">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">Processing Swap</h3>
                <p className="text-sm text-gray-300">Please wait while we execute your trade...</p>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card-body">
        <div className="mb-4">
          <h3 className="text-base font-semibold mb-2 text-gray-200">Trade</h3>
          
          {activePersona ? (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-6 h-6 rounded-full bg-white text-neutral-900 flex items-center justify-center font-semibold" aria-hidden>
                {activePersona.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{activePersona.name}</span>
              <span className="chip">Active persona</span>
            </div>
          ) : (
            <div className="text-amber-400 text-sm">
              No active persona selected
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Swap form">
          {/* Input token */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="amount">
              From
            </label>
            <div className="flex gap-2">
              <input
                id="amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className={`input ${isSwapping ? 'opacity-60' : ''}`}
                disabled={!activePersona || isSwapping}
                required
                aria-describedby="amount-help"
              />
              <select
                aria-label="Input token"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className={`input w-32 ${isSwapping ? 'opacity-60' : ''}`}
                disabled={!activePersona || isSwapping}
              >
                {tokens.filter(t => t !== outputToken).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
            <p id="amount-help" className="text-xs text-gray-500 mt-1">Estimated 2% slippage in simulation.</p>
          </div>
          
           {/* Switch tokens button */}
           <div className="flex justify-center">
             <button 
               type="button" 
               onClick={handleTokenSwitch}
               className={`btn btn-ghost w-10 h-10 rounded-full p-0 ${isSwapping ? 'opacity-60' : ''}`}
               disabled={!activePersona || isSwapping}
               aria-label="Switch input and output tokens"
               title="Switch tokens"
             >
               {isSwapping ? (
                 <div className="animate-spin text-xl text-blue-400">⟳</div>
               ) : (
                 <span className="text-lg">⇅</span>
               )}
             </button>
           </div>
          
          {/* Output token */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="output">
              To (estimated)
            </label>
            <div className="flex gap-2">
              <div id="output" className={`input bg-neutral-900/70 border-dashed text-gray-300 ${isSwapping ? 'opacity-60' : ''}`}>
                {isSwapping ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">...</div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  amount ? parseFloat(amount * 0.98).toFixed(6) : '0.0'
                )}
              </div>
              <select
                aria-label="Output token"
                value={outputToken}
                onChange={(e) => setOutputToken(e.target.value)}
                className={`input w-32 ${isSwapping ? 'opacity-60' : ''}`}
                disabled={!activePersona || isSwapping}
              >
                {tokens.filter(t => t !== inputToken).map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mid-trade switch (demo) */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1" htmlFor="mid-switch">
              Mid-trade switch (optional)
            </label>
            <div className="flex gap-2">
              <select
                id="mid-switch"
                value={midSwitchId}
                onChange={(e) => setMidSwitchId(e.target.value)}
                className={`input ${isSwapping ? 'opacity-60' : ''}`}
                disabled={!activePersona || isSwapping}
              >
                <option value="">Keep current persona</option>
                {personas.filter(p => p.id !== activePersona?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          
           {/* Submit button */}
           <button
             type="submit"
             className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed relative"
             disabled={!activePersona || !amount || isSwapping}
             aria-label="Execute swap"
           >
             {isSwapping ? (
               <div className="flex items-center justify-center gap-3">
                 <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                 <span className="text-lg font-medium">Processing...</span>
               </div>
             ) : (
               'Swap'
             )}
           </button>
        </form>
      </div>
    </div>
  );
}
