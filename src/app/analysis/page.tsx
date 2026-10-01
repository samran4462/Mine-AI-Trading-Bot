"use client";
import React, { useState } from 'react';

export default function MarketAnalysis() {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runFullScan = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/analysis/full-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      
      const data = await response.json();
      if (data.status === 'error') {
        setError(data.message);
      } else {
        setScanResult(data);
      }
    } catch (err) {
      setError("Failed to connect to Python Backend. Make sure it's running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Market Analysis Pipeline</h1>
        <button 
          onClick={() => runFullScan("BTC/USDT")}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded text-sm transition shadow"
        >
          {loading ? "Scanning Binance Data..." : "Run Live Binance Scan (BTC)"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Dynamic BTCUSDT Panel */}
        <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md ${!scanResult ? 'opacity-80' : 'border-blue-500/50'}`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600/20 text-orange-500 rounded flex items-center justify-center font-bold text-lg border border-orange-600/30">₿</div>
              <div>
                <h2 className="text-xl font-bold text-gray-200">BTC/USDT</h2>
                <p className="text-xs text-gray-400">Live Binance Futures Data</p>
              </div>
            </div>
            {scanResult ? (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-semibold rounded border border-green-700">Scan Complete</span>
            ) : (
              <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs font-semibold rounded border border-yellow-700">Waiting for Scan</span>
            )}
          </div>

          {!scanResult && !loading && (
             <div className="bg-gray-900 p-8 rounded border border-gray-700 flex flex-col items-center justify-center text-center h-64">
                <p className="text-gray-400 font-medium">Click "Run Live Binance Scan" to fetch latest OHLCV and run the pipeline.</p>
             </div>
          )}
          
          {loading && (
             <div className="bg-gray-900 p-8 rounded border border-gray-700 flex flex-col items-center justify-center text-center h-64 animate-pulse">
                <p className="text-blue-400 font-medium">Analyzing LTF Structure & Liquidity...</p>
             </div>
          )}

          {scanResult && !loading && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">LTF Structure (Live)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                    <span className="text-sm">Current Price</span>
                    <span className="text-sm font-bold text-white">${scanResult.market_data.current_price}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                    <span className="text-sm">Structure Bias</span>
                    <span className={`text-sm font-bold uppercase ${scanResult.market_data.ltf_structure === 'bullish' ? 'text-green-400' : scanResult.market_data.ltf_structure === 'bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {scanResult.market_data.ltf_structure}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Liquidity Profile</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700">
                    <span className="text-sm">Latest Activity</span>
                    <span className="text-sm font-bold text-yellow-400">{scanResult.market_data.liquidity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">AI Strategy Validation</h3>
                <div className={`p-4 rounded border ${scanResult.decision === 'TRADE' ? 'bg-green-900/20 border-green-800/50' : 'bg-red-900/20 border-red-800/50'}`}>
                  <div className="flex items-start">
                    <div>
                      <p className={`text-sm font-bold ${scanResult.decision === 'TRADE' ? 'text-green-400' : 'text-red-400'}`}>
                        {scanResult.decision}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{scanResult.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
