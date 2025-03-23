import { useState } from 'react';

interface FullScreenViewerProps {
  files: Array<{ id: string; file: File; status: string }>;
  selectedFileId: string;
  results: any;
  onClose: () => void;
}

// Helper function to format text
const formatText = (text: string) => {
  if (!text) return '';
  
  // Split text into lines
  return text.split('\n').map((line, index) => {
    // Handle headers (###)
    if (line.startsWith('###')) {
      return (
        <h4 key={index} className="text-lg font-semibold text-[#333333] mt-4 mb-2">
          {line.replace('###', '').trim()}
        </h4>
      );
    }
    
    // Handle bold text (**)
    if (line.includes('**')) {
      const parts = line.split('**');
      return (
        <p key={index} className="mb-2">
          {parts.map((part, pIndex) => (
            pIndex % 2 === 1 ? 
              <strong key={pIndex} className="font-semibold">{part}</strong> : 
              <span key={pIndex}>{part}</span>
          ))}
        </p>
      );
    }
    
    // Regular text
    return <p key={index} className="mb-2">{line}</p>;
  });
};

export function FullScreenViewer({ files, selectedFileId, results, onClose }: FullScreenViewerProps) {
  const [activeFileId, setActiveFileId] = useState(selectedFileId);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300">
      <div className="fixed inset-4 bg-white rounded-xl shadow-2xl flex overflow-hidden
        animate-[fadeIn_0.3s_ease-out]">
        {/* Left Sidebar - File List */}
        <div className="w-64 border-r border-[#e0e0e0] p-4 overflow-y-auto">
          <h3 className="text-xl font-semibold text-[#333333] mb-4">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`p-3 rounded-lg cursor-pointer text-sm
                  ${activeFileId === file.id ? 'bg-[#f0f0f0]' : 'bg-white'}
                  hover:bg-[#f0f0f0] transition-colors duration-200`}
              >
                <span className="text-[#444444] truncate block">{file.file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center - PDF Viewer */}
        <div className="flex-1 bg-[#f8f8f8] overflow-hidden">
          {activeFileId && (
            <iframe
              src={URL.createObjectURL(files.find(f => f.id === activeFileId)?.file!)}
              className="w-full h-full"
              title="Document Preview"
            />
          )}
        </div>

        {/* Right Sidebar - Report */}
        <div className="w-96 border-l border-[#e0e0e0] overflow-y-auto">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#333333]">Validation Report</h2>
            
            {results.data.summary && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#333333]">Summary</h3>
                <div className="font-mono text-sm text-[#444444] whitespace-pre-wrap bg-[#f8f8f8] p-4 rounded-lg">
                  {formatText(results.data.summary)}
                </div>
              </div>
            )}

            {results.data.validation && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#333333]">Validation</h3>
                <div className="font-mono text-sm text-[#444444] whitespace-pre-wrap bg-[#f8f8f8] p-4 rounded-lg">
                  {formatText(results.data.validation)}
                </div>
              </div>
            )}

            {results.data.fraud_risk && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#333333]">Fraud Risk Assessment</h3>
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
                    <span className="text-[#333333]">
                      {(results.data.fraud_risk.document_similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  {results.data.fraud_risk?.text_analysis?.reasons?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[#444444]">Reasons:</span>
                      <ul className="list-disc list-inside text-sm text-[#444444]">
                        {results.data.fraud_risk.text_analysis.reasons.map((reason: string, index: number) => (
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

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-[#333333] 
            transition-colors p-2 rounded-full hover:bg-[#f0f0f0]"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 