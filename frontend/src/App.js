import { useState } from 'react';
import { Upload, FileUp, FileDown } from 'lucide-react';
const API_URL = process.env.REACT_APP_SERVER_URL;

const FileProcessor = () => {
  const [encodeStatus, setEncodeStatus] = useState('');
  const [decodeStatus, setDecodeStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDecodeFiles, setSelectedDecodeFiles] = useState([]); 
  const [selectedEncodeFiles, setSelectedEncodeFiles] = useState([]); 


  const handleEncode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEncodeStatus('');
    //server name
    console.log(API_URL);

    const formData = new FormData();
    const file = e.target.file.files[0];

    if (!file) {
      setEncodeStatus('Please select a file');
      setIsLoading(false);
      return;
    }
    formData.append('requiredShares', e.target['required-shares'].value);
    formData.append('redundantShares', e.target['redundant-shares'].value);
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/encode`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'encoded_shares.zip';
        a.click();
        setEncodeStatus('success');
      } else {
        setEncodeStatus('error');
      }
    } catch (error) {
      setEncodeStatus('error');
    }
    setIsLoading(false);
  };

  const handleDecode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setDecodeStatus('');

    const formData = new FormData();
    formData.append('requiredShares', e.target['required-shares'].value);
    formData.append('redundantShares', e.target['redundant-shares'].value);
    const files = e.target.files.files;

    if (files.length === 0) {
      setDecodeStatus('Please select files');
      setIsLoading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    try {
      const response = await fetch(`${API_URL}/encode`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded_file';
        a.click();
        setDecodeStatus('success');
      } else {
        const error = await response.text();
        setDecodeStatus('error');
      }
    } catch (error) {
      setDecodeStatus('error');
    }
    setIsLoading(false);
  };

  const handleFileSelectionDecode = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDecodeFiles(files.map((file) => file.name)); // Store selected file names
  };
  const handleFileSelectionEncode = (e) => {
    const files = Array.from(e.target.files);
    setSelectedEncodeFiles(files.map((file) => file.name)); // Store selected file names
  };

  const StatusAlert = ({ status, type }) => {
    if (!status) return null;

    const bgColor = status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const message =
      status === 'success' ? `File ${type} successfully!` : `Failed to ${type} file`;

    return <div className={`${bgColor} p-4 rounded-lg mt-4`}>{message}</div>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Reed Solomon Error Correction Codes Demo</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Encode Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Encode File
          </h2>
          <form onSubmit={handleEncode} className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                name="file"
                id="encode-file"
                className="hidden"
                onChange={handleFileSelectionEncode} 
              />
              <label
                htmlFor="encode-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8" />
                <span>Select file to encode</span>
              </label>
            </div>
            {/* Section tu put in number of required shares and redundant shares (numbers) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="required-shares" className="text-sm font-semibold">
                Number of required shares
              </label>
              <input
                type="number"
                name="required-shares"
                id="required-shares"
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="redundant-shares" className="text-sm font-semibold">
                Number of redundant shares
              </label>
              <input
                type="number"
                name="redundant-shares"
                id="redundant-shares"
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>

            {selectedEncodeFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Selected Files:</h3>
                <ul className="list-disc list-inside text-sm">
                  {selectedEncodeFiles.map((file, index) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : 'Encode'}
            </button>
          </form>
          <StatusAlert status={encodeStatus} type="encoded" />
        </div>

        {/* Decode Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Decode Files
          </h2>
          <form onSubmit={handleDecode} className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                name="files"
                id="decode-files"
                multiple
                className="hidden"
                onChange={handleFileSelectionDecode} 
              />
              <label
                htmlFor="decode-files"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8" />
                <span>Select shares to decode</span>
              </label>
            </div>
             {/* Section tu put in number of required shares and redundant shares (numbers) */}
             <div className="flex flex-col gap-2">
              <label htmlFor="required-shares" className="text-sm font-semibold">
                Number of required shares
              </label>
              <input
                type="number"
                name="required-shares"
                id="required-shares"
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="redundant-shares" className="text-sm font-semibold">
                Number of redundant shares
              </label>
              <input
                type="number"
                name="redundant-shares"
                id="redundant-shares"
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
            {selectedDecodeFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Selected Files:</h3>
                <ul className="list-disc list-inside text-sm">
                  {selectedDecodeFiles.map((file, index) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : 'Decode'}
            </button>
          </form>
          <StatusAlert status={decodeStatus} type="decoded" />
        </div>
      </div>
    </div>
  );
};

export default FileProcessor;
