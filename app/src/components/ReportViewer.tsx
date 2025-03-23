export function ReportViewer({ results, onClose }: { 
  results: { data: { 
    summary: string | null; 
    validation: string | null;
    fraud_risk: {
      text_analysis: {
        fraud_risk: string;
        reasons: string[];
        verification_needed: boolean;
      };
      document_similarity: number;
      combined_risk: string;
    } | null;
  } }; 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-y-0 left-0 w-[600px] bg-white shadow-xl overflow-hidden
      transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0]">
        <h2 className="text-lg font-medium text-[#333333]">Validation Report</h2>
        <button
          onClick={onClose}
          className="text-[#666666] hover:text-[#333333] transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="h-[calc(100vh-64px)] overflow-auto p-6 space-y-6">
        {results.data.summary && (
          <div className="space-y-2">
            <h3 className="text-[#333333] font-medium">Summary</h3>
            <div className="font-mono text-sm text-[#444444] whitespace-pre-wrap bg-[#f8f8f8] p-4 rounded-lg">
              {results.data.summary}
            </div>
          </div>
        )}
        {results.data.validation && (
          <div className="space-y-2">
            <h3 className="text-[#333333] font-medium">Validation</h3>
            <div className="font-mono text-sm text-[#444444] whitespace-pre-wrap bg-[#f8f8f8] p-4 rounded-lg">
              {results.data.validation}
            </div>
          </div>
        )}
        {results.data.fraud_risk && (
          <div className="space-y-2">
            <h3 className="text-[#333333] font-medium">Fraud Risk Assessment</h3>
            <div className="bg-[#f8f8f8] rounded-lg p-4 space-y-4">
              <div>
                <span className="text-[#444444]">Risk Level: </span>
                <span className={`font-semibold ${
                  results.data.fraud_risk.combined_risk === 'high' ? 'text-red-600' :
                  results.data.fraud_risk.combined_risk === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {results.data.fraud_risk.combined_risk.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[#444444]">Document Similarity: </span>
                <span className="text-[#333333]">{(results.data.fraud_risk.document_similarity * 100).toFixed(1)}%</span>
              </div>
              {results.data.fraud_risk.text_analysis.reasons.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[#444444]">Reasons:</span>
                  <ul className="list-disc list-inside text-sm text-[#444444]">
                    {results.data.fraud_risk.text_analysis.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 