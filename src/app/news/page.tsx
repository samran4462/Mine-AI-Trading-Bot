export default function NewsEngine() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">News & Events Engine</h1>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-red-400">High-Impact Event Monitoring</h2>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded border border-gray-600 flex justify-between items-center">
            <div>
              <p className="font-bold">FOMC Interest Rate Decision</p>
              <p className="text-sm text-gray-400">Scheduled: 14:00 EST</p>
            </div>
            <div className="text-right">
              <span className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Blackout Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
