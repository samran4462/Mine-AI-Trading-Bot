"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const mockData = [
  { trade: 1, pnl: 50, cumulative: 50 },
  { trade: 2, pnl: -20, cumulative: 30 },
  { trade: 3, pnl: 45, cumulative: 75 },
  { trade: 4, pnl: 60, cumulative: 135 },
  { trade: 5, pnl: -25, cumulative: 110 },
  { trade: 6, pnl: 40, cumulative: 150 },
  { trade: 7, pnl: 55, cumulative: 205 },
];

export default function EquityChart() {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="trade" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area type="monotone" dataKey="cumulative" stroke="#10b981" fillOpacity={1} fill="url(#colorCumulative)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
