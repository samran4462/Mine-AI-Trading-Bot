"use client";
import React from 'react';
import EquityChart from '../../components/charts/EquityChart';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">System Dashboard</h1>
        <div className="flex space-x-3">
          <span className="px-3 py-1 bg-green-900 text-green-300 text-sm font-semibold rounded-full flex items-center border border-green-700">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            System Online
          </span>
          <span className="px-3 py-1 bg-blue-900 text-blue-300 text-sm font-semibold rounded-full border border-blue-700">
            One-Trade-At-A-Time Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Win Rate</h2>
          <p className="text-3xl font-bold text-white">68.5%</p>
          <p className="text-xs text-green-400 mt-2">↑ 2.4% vs last week</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Profit Factor</h2>
          <p className="text-3xl font-bold text-white">1.85</p>
          <p className="text-xs text-green-400 mt-2">Target: &gt; 1.5</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Max Drawdown</h2>
          <p className="text-3xl font-bold text-red-400">-4.2%</p>
          <p className="text-xs text-gray-400 mt-2">Within acceptable risk limit</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Total PnL</h2>
          <p className="text-3xl font-bold text-green-400">+$2,450.00</p>
          <p className="text-xs text-gray-400 mt-2">Paper Trading Acc</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-200">Equity Curve</h2>
            <select className="bg-gray-700 border border-gray-600 text-sm rounded px-2 py-1 text-gray-300 focus:outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <EquityChart />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-xl font-bold text-gray-200 mb-4">Live Execution Feed</h2>
          <div className="space-y-4">
            <div className="flex justify-center items-center p-8 bg-gray-900 rounded border border-gray-700 h-full">
               <p className="text-sm text-gray-500 text-center">Awaiting live trade executions from the Auto-Trade engine.<br/>Go to the <b>Paper Trading</b> tab to run the scanner.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
