export function ReportViewer({ results, onClose }: { 
  results: { data: { summary: string | null; validation: string | null } }; 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-y-0 left-0 w-[600px] bg-[#1E1E1E] shadow-xl
      transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
        <h2 className="text-lg font-medium text-white">Validation Report</h2>
        <button
          onClick={onClose}
          className="text-[#CCCCCC] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="h-full overflow-auto p-6 space-y-6">
        {results.data.summary && (
          <div className="space-y-2">
            <h3 className="text-[#CCCCCC] font-medium">Summary</h3>
            <div className="font-mono text-sm text-[#CCCCCC] whitespace-pre-wrap">
              {results.data.summary}
            </div>
          </div>
        )}
        {results.data.validation && (
          <div className="space-y-2">
            <h3 className="text-[#CCCCCC] font-medium">Validation</h3>
            <div className="font-mono text-sm text-[#CCCCCC] whitespace-pre-wrap">
              {results.data.validation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 