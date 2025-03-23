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
    <div className="min-h-screen bg-[#eaeaea] text-[#333333] relative">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col items-center gap-8">
          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold font-inter text-[#333333]">
            Insurance Claim Validator
          </h1>

          {/* File List and Upload Section */}
          <div className="w-full max-w-3xl bg-[#f8f8f8] rounded-xl p-6 shadow-sm">
            {/* File List */}
            <div className="space-y-2 mb-4">
              {files.map((fileStatus) => (
                <div
                  key={fileStatus.id}
                  onClick={() => handleFileClick(fileStatus.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                    ${selectedFileId === fileStatus.id ? 'bg-[#e0e0e0]' : 'bg-white'}
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
              <span className="text-[#444444]">Upload More Files</span>
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

          {/* Toggle Report Button */}
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
        </main>
      </div>

      {/* Report Viewer Slide-out */}
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
