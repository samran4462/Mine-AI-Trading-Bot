'use client';
import { API_BASE } from '../../lib/api';
import React, { useState, useRef } from 'react';

export default function AutoTrading() {
  const [platform, setPlatform] = useState("binance");
  const [amount, setAmount] = useState("2");
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  
  // Progress states
  const [progressMsg, setProgressMsg] = useState("");
  const [scannedCount, setScannedCount] = useState(0);
  const [totalToScan, setTotalToScan] = useState(0);
  const [validSignals, setValidSignals] = useState<any[]>([]);
  const [scanFinished, setScanFinished] = useState(false);
  
  const [executionMessage, setExecutionMessage] = useState<any>(null);

  const [binanceKey, setBinanceKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const handleCheckBalance = async () => {
    if (!binanceKey || !binanceSecret) {
      alert("Please enter API Key and Secret first.");
      return;
    }
    setCheckingBalance(true);
    try {
      const response = await fetch((API_BASE) + '/api/v1/trading/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'binance',
          binance_api_key: binanceKey,
          binance_api_secret: binanceSecret
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setBalance(data.usdt_balance.toString());
      } else {
        alert("Failed to fetch balance: " + data.message);
      }
    } catch (e) {
      alert("Network error fetching balance.");
    } finally {
      setCheckingBalance(false);
    }
  };

  const [isAutoBotRunning, setIsAutoBotRunning] = useState(false);
  const botRunningRef = useRef(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const autoBotRef = useRef<any>(null);
  
  const addLog = (msg: string) => {
      setBotLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const startAutoBot = async () => {
      if (!binanceKey || !binanceSecret) {
          alert("Please enter API Key and Secret for Auto-Bot to execute trades.");
          return;
      }
      setIsAutoBotRunning(true);
      botRunningRef.current = true;
      addLog("ðŸ¤– 24/7 Auto-Trading Bot Started...");
      addLog(`Setting Trade Amount: $${amount}`);
      
      // Run once immediately, then loop
      runAutoBotCycle();
      autoBotRef.current = setInterval(runAutoBotCycle, 60000); // Check every 60 seconds
  };
  
  const stopAutoBot = () => {
      setIsAutoBotRunning(false);
      botRunningRef.current = false;
      if (autoBotRef.current) clearInterval(autoBotRef.current);
      addLog("ðŸ›‘ Auto-Trading Bot Stopped.");
  };
  
  const runAutoBotCycle = async () => {
      if (!botRunningRef.current) return;
      
      try {
          // 1. Sync state with Binance directly
          const syncRes = await fetch((API_BASE) + '/api/v1/trading/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ platform, binance_api_key: binanceKey, binance_api_secret: binanceSecret })
          });
          const syncData = await syncRes.json();
          
          if (syncData.status === 'success' && syncData.active) {
              const tr = syncData.trade;
              const pnl = parseFloat(tr.pnl);
              addLog('⏳ TRADE ACTIVE: ' + tr.symbol + ' (' + tr.side + ') | PNL: $' + tr.pnl);
              if (pnl >= 0.05) {
                  addLog('✅ PROFIT TARGET HIT! PNL $' + tr.pnl + ' | Closing ' + tr.symbol + ' NOW!');
                  try {
                      await fetch((API_BASE) + '/api/v1/trading/close-live-position', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ platform, symbol: tr.symbol, binance_api_key: binanceKey, binance_api_secret: binanceSecret })
                      });
                      addLog('🎉 PROFIT LOCKED! $' + tr.pnl + ' secured!');
                  } catch(e) { addLog('Close error: ' + e); }
              } else if (pnl <= -0.10) {
                  addLog('🛑 Safety Stop! PNL $' + tr.pnl + '. Closing to protect capital!');
                  try {
                      await fetch((API_BASE) + '/api/v1/trading/close-live-position', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ platform, symbol: tr.symbol, binance_api_key: binanceKey, binance_api_secret: binanceSecret })
                      });
                  } catch(e) {}
              }
              return;
          }
          
          // 2. If no active trade, scan for new setups
          addLog("Scanning market for safe setups...");
          const topTokensRes = await fetch((API_BASE) + '/api/v1/analysis/get-top-tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, limit: 25 })
          });
          const topTokensData = await topTokensRes.json();
          const tokens = topTokensData.symbols || [];
          
          let foundTrade = false;
          
          // Fast scan
          for (const sym of tokens) {
              if (!botRunningRef.current) break; // Break if stopped
              const scanRes = await fetch((API_BASE) + '/api/v1/analysis/scan-single', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ platform, symbol: sym })
              });
              const result = await scanRes.json();
              
              if (result.status === 'success' && result.decision === 'TRADE') {
                  addLog(`ðŸ”¥ PERFECT SIGNAL FOUND: ${sym} (${result.bias.toUpperCase()})`);
                  foundTrade = true;
                  
                  // Auto Execute
                  addLog(`Executing Auto-Trade on ${sym} for $${amount}...`);
                  try {
                      const execRes = await fetch((API_BASE) + '/api/v1/trading/execute-live-trade', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                              platform: platform,
                              symbol: result.symbol,
                              bias: result.bias,
                              amount: parseFloat(amount),
                              current_price: result.price,
                              take_profit: result.take_profit,
                              stop_loss: result.stop_loss,
                              binance_api_key: binanceKey,
                              binance_api_secret: binanceSecret
                          })
                      });
                      const execData = await execRes.json();
                      if (execData.status === 'success') {
                          addLog(`âœ… TRADE EXECUTED SUCCESSFULLY! TP/SL attached. The bot will wait for Binance to auto-close it in profit.`);
                          handleCheckBalance();
                          // Stop scanning for this cycle after 1 successful trade to avoid overtrading
                          break;
                      } else {
                          addLog(`âŒ Execution Failed: ${execData.message}`);
                      }
                  } catch (e) {
                      addLog(`âŒ Network Error executing trade.`);
                  }
              }
          }
          if (!foundTrade && botRunningRef.current) {
              addLog("No safe signals found this cycle. Waiting for next cycle...");
          }
      } catch (e) {
          addLog("âŒ Error connecting to server.");
      }
  };

  const handleScan = async () => {
    setLoading(true);
    setScanFinished(false);
    setValidSignals([]);
    setExecutionMessage(null);
    setScannedCount(0);
    
    try {
      setProgressMsg("Fetching top market movers...");
      // 1. Get tokens
      const topTokensRes = await fetch((API_BASE) + '/api/v1/analysis/get-top-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, limit: platform === "binance" ? 20 : 5 })
      });
      const topTokensData = await topTokensRes.json();
      const tokens = topTokensData.symbols || [];
      setTotalToScan(tokens.length);
      
      // 2. Scan Concurrently for INSTANT results
      let completed = 0;
      
      const scanPromises = tokens.map(async (sym: string) => {
        try {
          const scanRes = await fetch((API_BASE) + '/api/v1/analysis/scan-single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, symbol: sym })
          });
          const result = await scanRes.json();
          
          completed++;
          setScannedCount(completed);
          setProgressMsg(`Analyzing massive data... (${completed}/${tokens.length})`);
          
          if (result.status === 'success') {
            const newSignal = {
              symbol: result.symbol,
              bias: result.bias,
              price: result.price,
              reason: result.reason,
              decision: result.decision,
              stop_loss: result.stop_loss,
              take_profit: result.take_profit,
              duration: result.duration,
              time: result.time
            };
            
            setValidSignals(prev => {
               if (!prev.find(s => s.symbol === result.symbol)) {
                 return [...prev, newSignal];
               }
               return prev;
            });
          }
        } catch (e) {
          console.error(`Error scanning ${sym}`, e);
          completed++;
          setScannedCount(completed);
        }
      });
      
      await Promise.all(scanPromises);
      
      setProgressMsg("Scan Complete!");
      setScanFinished(true);
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTrade = async (signal: any) => {
    if (platform === 'binance' && (!binanceKey || !binanceSecret)) {
      setExecutionMessage({ status: "error", message: "Please enter your Binance API Key and Secret at the top before executing." });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Amount Verification step as requested
    const confirmMsg = `Are you sure you want to execute a ${signal.bias.toUpperCase()} trade on ${signal.symbol} with $${amount}?`;
    if (!window.confirm(confirmMsg)) {
        return;
    }
    
    setExecuting(true);
    try {
      const response = await fetch((API_BASE) + '/api/v1/trading/execute-live-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platform,
          symbol: signal.symbol,
          bias: signal.bias,
          amount: parseFloat(amount),
          current_price: signal.price,
          take_profit: signal.take_profit,
          stop_loss: signal.stop_loss,
          binance_api_key: binanceKey,
          binance_api_secret: binanceSecret
        })
      });
      const data = await response.json();
      setExecutionMessage(data);
      if (data.status === 'success') {
         handleCheckBalance(); // update balance after trade
      }
    } catch (e) {
      setExecutionMessage({ status: "error", message: "Network error during execution." });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Live Auto-Trading Engine</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
        <h2 className="text-xl font-bold mb-4 text-white">1. Trade Settings & Credentials</h2>
        
        {platform === 'binance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-900 border border-yellow-700/50 rounded">
            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-2">Binance API Key</label>
              <input 
                type="password"
                placeholder="Paste API Key (Requires Trade Permissions)"
                className="w-full bg-gray-950 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-yellow-500"
                value={binanceKey}
                onChange={e => setBinanceKey(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-2">Binance API Secret</label>
              <input 
                type="password"
                placeholder="Paste API Secret"
                className="w-full bg-gray-950 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-yellow-500"
                value={binanceSecret}
                onChange={e => setBinanceSecret(e.target.value)}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center justify-between bg-gray-950 p-3 rounded border border-gray-800">
               <div>
                  <span className="text-gray-400 text-sm mr-2">Available USDT Balance:</span>
                  <span className="text-green-400 font-bold text-lg">{balance !== null ? `$${balance}` : '---'}</span>
               </div>
               <button 
                  onClick={handleCheckBalance}
                  disabled={checkingBalance}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded shadow transition"
               >
                  {checkingBalance ? 'Checking...' : 'Verify Balance'}
               </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Platform</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-blue-500"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
            >
              <option value="binance">Binance (Scans Top 15 Trending Crypto)</option>
              <option value="mt5">MetaTrader 5 (Scans XAUUSD/Major Forex)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {platform === 'binance' ? 'Trade Size per order (USDT - Min $2)' : 'Lot Size per order'}
            </label>
            <input 
              type="number"
              min={platform === 'binance' ? "2" : "0.01"}
              step="any"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:outline-none focus:border-blue-500"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button 
            onClick={handleScan}
            disabled={loading || executing || isAutoBotRunning}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded shadow-lg text-lg transition duration-200 flex justify-center items-center"
          >
            {loading ? (
               <span className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 {progressMsg}
               </span>
            ) : "Manual Scan: Find Best Signals"}
          </button>

          {!isAutoBotRunning ? (
            <button 
              onClick={startAutoBot}
              disabled={loading || executing}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold rounded shadow-lg text-lg transition duration-200 flex justify-center items-center border border-purple-400"
            >
               ðŸš€ START 24/7 FULL AUTO BOT
            </button>
          ) : (
            <button 
              onClick={stopAutoBot}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg text-lg transition duration-200 flex justify-center items-center border border-red-400 animate-pulse"
            >
               ðŸ›‘ STOP FULL AUTO BOT
            </button>
          )}
        </div>
        
        {loading && totalToScan > 0 && !isAutoBotRunning && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(scannedCount / totalToScan) * 100}%` }}></div>
          </div>
        )}
      </div>

      {/* Auto Bot Live Logs */}
      {botLogs.length > 0 && (
          <div className="bg-gray-900 border border-purple-700 p-6 rounded-lg shadow-[0_0_20px_rgba(128,0,128,0.2)]">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-purple-400 flex items-center">
                 <span className={`h-3 w-3 rounded-full mr-3 ${isAutoBotRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                 Auto-Bot Live Terminal
               </h2>
               <span className="text-sm text-gray-400">Status: {isAutoBotRunning ? 'RUNNING' : 'STOPPED'}</span>
             </div>
             <div className="bg-black p-4 rounded h-64 overflow-y-auto font-mono text-sm border border-gray-800">
                {botLogs.map((log, i) => (
                    <div key={i} className={`mb-1 ${log.includes('ðŸ”¥') || log.includes('âœ…') ? 'text-green-400 font-bold' : log.includes('âŒ') ? 'text-red-400' : 'text-gray-300'}`}>
                        {log}
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* Manual Results & Execution Panel */}
      {validSignals.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">2. AI Market Analysis Log</h2>
            <span className="text-sm text-gray-400">Evaluated {scannedCount}/{totalToScan} pairs</span>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {validSignals
              .sort((a, b) => (a.decision === 'TRADE' ? -1 : 1)) // Show TRADE signals at the top
              .map((signal: any, idx: number) => (
              <div key={idx} className={`border p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${signal.decision === 'TRADE' ? 'bg-gray-900 border-green-700/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]' : 'bg-gray-900 border-gray-700 opacity-70'}`}>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className={`${signal.decision === 'TRADE' ? 'text-green-400' : 'text-gray-400'} font-bold text-xl`}>
                      {signal.symbol} 
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${signal.decision === 'TRADE' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {signal.decision}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Time: {signal.time}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-950 p-3 rounded mb-3 border border-gray-800">
                     <div>
                       <p className="text-xs text-gray-500">Action (Bias)</p>
                       <p className={`font-bold ${signal.bias === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>{signal.bias.toUpperCase()} {signal.bias === 'bullish' ? 'BUY' : 'SELL'}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Entry Price</p>
                       <p className="font-bold text-white">${signal.price}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Take Profit (TP)</p>
                       <p className="font-bold text-green-400">${signal.take_profit}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Stop Loss (SL)</p>
                       <p className="font-bold text-red-400">${signal.stop_loss}</p>
                     </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm">
                    <strong>Est. Duration:</strong> {signal.duration}
                  </p>
                  <p className={`${signal.decision === 'TRADE' ? 'text-blue-300' : 'text-gray-500'} text-sm mt-1`}>
                    <strong>AI Analysis:</strong> {signal.reason}
                  </p>
                </div>
                
                {signal.decision === 'TRADE' && (
                  <button 
                    onClick={() => handleAutoTrade(signal)}
                    disabled={executing}
                    className="px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded shadow-lg transition whitespace-nowrap h-full"
                  >
                    {executing ? "Executing..." : `EXECUTE ${signal.bias === 'bullish' ? 'BUY' : 'SELL'}`}
                  </button>
                )}
              </div>
            ))}
          </div>

          {executionMessage && (
            <div className={`mt-6 p-4 rounded border ${executionMessage.status === 'success' ? 'bg-blue-900/20 border-blue-700' : 'bg-red-900/20 border-red-700'}`}>
               <h3 className="font-bold text-lg mb-1 text-white">Execution Status:</h3>
               <p className={executionMessage.status === 'success' ? 'text-blue-400' : 'text-red-400'}>
                 {executionMessage.status === 'success' 
                   ? `âœ… Order Successfully Placed on ${platform.toUpperCase()}! Check your terminal.` 
                   : `âŒ Failed: ${executionMessage.message}`}
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


