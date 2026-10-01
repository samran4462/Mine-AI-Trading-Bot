import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Trading System",
  description: "AI-powered market analysis and scalping research platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white flex h-screen overflow-hidden">
        {/* Sidebar placeholder */}
        <aside className="w-64 bg-gray-800 p-4 hidden md:flex flex-col">
          <h1 className="text-xl font-bold text-blue-400 mb-8">AI TRADING SYSTEM</h1>
          <nav className="flex flex-col space-y-2">
            <a href="/dashboard" className="p-3 hover:bg-gray-700 rounded transition font-medium text-gray-300 hover:text-white flex items-center">
              <span className="mr-3">📊</span> Dashboard
            </a>
            <a href="/analysis" className="p-3 hover:bg-gray-700 rounded transition font-medium text-gray-300 hover:text-white flex items-center">
              <span className="mr-3">🔍</span> Market Analysis
            </a>
            <a href="/trading" className="p-3 hover:bg-gray-700 rounded transition font-medium text-gray-300 hover:text-white flex items-center">
              <span className="mr-3">⚡</span> Paper Trading
            </a>
            <a href="/news" className="p-3 hover:bg-gray-700 rounded transition font-medium text-gray-300 hover:text-white flex items-center">
              <span className="mr-3">📰</span> News Engine
            </a>
            <a href="/dashboard" className="p-3 hover:bg-gray-700 rounded transition font-medium text-gray-300 hover:text-white flex items-center mt-4 border-t border-gray-700 pt-4">
              <span className="mr-3">⏪</span> Backtesting (WIP)
            </a>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
