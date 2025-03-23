export function DocumentViewer({ file, onClose }: { file: File; onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-[#1E1E1E] shadow-xl
      transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
        <h2 className="text-lg font-medium text-white">{file.name}</h2>
        <button
          onClick={onClose}
          className="text-[#CCCCCC] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="h-full overflow-auto p-4">
        {/* Add document preview based on file type */}
        <iframe
          src={URL.createObjectURL(file)}
          className="w-full h-full"
          title={file.name}
        />
      </div>
    </div>
  );
} 