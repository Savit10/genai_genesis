'use client';
import { useState } from "react";
import { StatusBadge } from '../components/StatusBadge';
import { ReportViewer } from '../components/ReportViewer';
import { FullScreenViewer } from '@/components/FullScreenViewer';

interface FileResult {
  filename: string;
  doc_type: string;
  content: {
    raw_text?: string;
    structured_data?: Record<string, any>;
  };
}

interface UploadResponse {
  status: string;
  message: string;
  data: {
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
  };
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  id: string;
}

interface ReportViewerProps {
  results: UploadResponse;
  onClose: () => void;
}

export default function Home() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UploadResponse | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        status: 'pending' as const,
        id: crypto.randomUUID()
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setLoading(true);
    // Update all files to processing status
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })));

    try {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data: UploadResponse = await response.json();
      setResults(data);
      // Update all files to completed status
      setFiles(prev => prev.map(f => ({ ...f, status: 'completed' as const })));
    } catch (error) {
      console.error('Error:', error);
      // Update all files to error status
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f0fefe] text-[#333333] relative">
      {/* Background Image and Title Section */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center">
        {/* Background Image */}
        <div className="absolute w-[60%] h-[60%] bg-[#f0fefe] rounded-3xl shadow-lg overflow-hidden">
          <img 
            src="/background-image.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        
        {/* Title Text Box */}
        <div className="relative z-10 max-w-2xl text-center mb-8 bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-[#434297] mb-4">
            Insurance Claim Validator
          </h1>
          <p className="text-lg md:text-xl text-[#434297]/80">
            Streamline your insurance claims with AI-powered validation and fraud detection
          </p>
        </div>

        {/* Upload Section - Positioned at bottom center */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl bg-white rounded-t-3xl p-8 shadow-lg">
          {/* File List */}
          <div className="space-y-2 mb-4">
            {files.map((fileStatus) => (
              <div
                key={fileStatus.id}
                onClick={() => handleFileClick(fileStatus.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                  ${selectedFileId === fileStatus.id ? 'bg-[#e0e0e0]' : 'bg-[#f8f8f8]'}
                  hover:bg-[#e0e0e0] transition-colors duration-200`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#444444]">{fileStatus.file.name}</span>
                </div>
                <StatusBadge status={fileStatus.status} />
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed
            border-[#cccccc] rounded-lg cursor-pointer hover:border-[#0078d4] transition-colors">
            <span className="text-[#444444]">Upload Files</span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.tiff,.bmp"
            />
          </label>

          {/* Generate Button */}
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || loading}
            className={`w-full mt-4 py-4 rounded-xl font-semibold transition-all duration-200
              ${files.length === 0
                ? 'bg-[#f0f0f0] text-[#999999] cursor-not-allowed'
                : 'bg-[#0078d4] hover:bg-[#106ebe] active:scale-97 text-white'}`}
          >
            Generate Validation Report
          </button>
        </div>
      </div>

      {/* Report Viewer Button */}
      {results && (
        <button
          onClick={() => setIsViewerOpen(true)}
          className="fixed bottom-8 right-8 bg-[#0078d4] px-6 py-4 rounded-xl shadow-lg
            hover:bg-[#106ebe] transition-colors duration-200 text-white font-medium text-lg
            flex items-center gap-2"
        >
          <span>View Report</span>
          <span>📄</span>
        </button>
      )}

      {/* Report Viewer */}
      {isViewerOpen && results && (
        <FullScreenViewer
          files={files}
          selectedFileId={selectedFileId || files[0]?.id}
          results={results}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedFileId(null);
          }}
        />
      )}
    </div>
  );
}
