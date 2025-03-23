'use client';
import { useState } from "react";
import { StatusBadge } from '../components/StatusBadge';
import { DocumentViewer } from '../components/DocumentViewer';
import { ReportViewer } from '../components/ReportViewer';

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
  };
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  id: string;
}

interface DocumentViewerProps {
  file: File;
  onClose: () => void;
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
  const [isReportOpen, setIsReportOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#121212] text-white relative">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col items-center gap-8">
          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold font-inter">
            Insurance Claim Validator
          </h1>

          {/* File List and Upload Section */}
          <div className="w-full max-w-3xl bg-[#2A2A2A] rounded-xl p-6">
            {/* File List */}
            <div className="space-y-2 mb-4">
              {files.map((fileStatus) => (
                <div
                  key={fileStatus.id}
                  onClick={() => setSelectedFileId(fileStatus.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                    ${selectedFileId === fileStatus.id ? 'bg-[#3A3A3A]' : 'bg-[#1E1E1E]'}
                    hover:bg-[#3A3A3A] transition-colors duration-200`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#CCCCCC]">{fileStatus.file.name}</span>
                  </div>
                  <StatusBadge status={fileStatus.status} />
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed
              border-[#3A3A3A] rounded-lg cursor-pointer hover:border-[#5ED4F4] transition-colors">
              <span className="text-[#CCCCCC]">Upload More Files</span>
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
                  ? 'bg-[#2A2A2A] text-[#888888] cursor-not-allowed'
                  : 'bg-[#5ED4F4] hover:bg-[#5ED4F4]/90 active:scale-97 text-white'}`}
            >
              Generate Validation Report
            </button>
          </div>

          {/* Toggle Report Button */}
          {results && (
            <button
              onClick={() => setIsReportOpen(prev => !prev)}
              className="fixed bottom-4 left-4 bg-[#5ED4F4] p-4 rounded-full shadow-lg
                hover:bg-[#5ED4F4]/90 transition-colors duration-200"
            >
              {isReportOpen ? '✕' : '📄'}
            </button>
          )}
        </main>
      </div>

      {/* Document Viewer Slide-out */}
      {selectedFileId && (
        <DocumentViewer
          file={files.find(f => f.id === selectedFileId)!.file}
          onClose={() => setSelectedFileId(null)}
        />
      )}

      {/* Report Viewer Slide-out */}
      {results && isReportOpen && (
        <ReportViewer
          results={results}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
