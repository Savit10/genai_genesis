import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col items-center gap-8">
          {/* Title Section */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-8">
            InsuraGenie
          </h1>
          
          {/* File Upload Section */}
          <div className="w-full max-w-xl p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-col items-center justify-center w-full">
              <label 
                htmlFor="file-upload"
                className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg 
                    className="w-10 h-10 mb-3 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX (MAX. 10MB)
                  </p>
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                />
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <button 
            className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            Process Document
          </button>
        </main>
      </div>
    </div>
  );
}
