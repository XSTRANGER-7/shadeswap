import { useState, useEffect } from 'react';

export default function TradeHistory({ activePersona, trades = [] }) {
  return (
    <div className="card flex flex-col">
      <div className="card-body flex-1 overflow-hidden flex flex-col">
        <h3 className="text-base font-semibold mb-4 text-gray-200">Trade History</h3>
        
        {activePersona ? (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-white text-neutral-900 flex items-center justify-center font-semibold">
                  {activePersona.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{activePersona.name}</span>
              </div>
            </div>
            
            {trades.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-96 scrollbar-thin scrollbar-track-neutral-800/50 scrollbar-thumb-neutral-600/50 hover:scrollbar-thumb-neutral-500/70 scrollbar-thumb-rounded-full scrollbar-track-rounded-full transition-all duration-300">
                {trades.map((trade, index) => (
                  <div 
                    key={index} 
                    className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-neutral-800/60 hover:border-neutral-600/70 hover:shadow-md hover:shadow-blue-500/5 group cursor-pointer"
                  >
                    {/* Main Trade Info */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-semibold text-sm bg-blue-500/10 px-2 py-1 rounded-md">
                          {trade.inputToken}
                        </span>
                        <span className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300 text-sm">
                          →
                        </span>
                        <span className="text-green-400 font-semibold text-sm bg-green-500/10 px-2 py-1 rounded-md">
                          {trade.outputToken}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 bg-neutral-800/50 px-2 py-1 rounded-md group-hover:text-gray-300 transition-colors duration-300">
                        {new Date(trade.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Amounts */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Amount</span>
                        <span className="text-gray-200 font-medium text-sm">
                          {trade.amountIn} {trade.inputToken}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">Received</span>
                        <span className="text-gray-100 font-semibold text-sm">
                          {trade.amountOut} {trade.outputToken}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-neutral-700/30 group-hover:border-neutral-600/50 transition-colors duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded-full font-medium text-xs">
                          Completed
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">Transaction Hash:</span>
                        <span className="text-xs text-gray-300 font-mono group-hover:text-gray-100 transition-colors duration-300 break-all bg-neutral-800/30 px-2 py-1 rounded">
                          {trade.txHash || `0x${Math.random().toString(16).substr(2, 40)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8 sm:py-12 text-gray-400 border border-dashed border-neutral-700/50 rounded-xl bg-neutral-900/30 w-full max-w-sm mx-auto">
                  <div className="flex flex-col items-center gap-3 px-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-800/50 flex items-center justify-center">
                      <span className="text-xl sm:text-2xl text-gray-500">📊</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-300 mb-1 text-sm sm:text-base">No trades yet</p>
                      <p className="text-xs sm:text-sm text-gray-500">Start trading to see your history here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 sm:py-12 text-gray-400 border border-dashed border-neutral-700/50 rounded-xl bg-neutral-900/30 w-full max-w-sm mx-auto">
              <div className="flex flex-col items-center gap-3 px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-800/50 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl text-gray-500">👤</span>
                </div>
                <div>
                  <p className="font-medium text-gray-300 mb-1 text-sm sm:text-base">Select a persona</p>
                  <p className="text-xs sm:text-sm text-gray-500">Choose a persona to view trade history</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
