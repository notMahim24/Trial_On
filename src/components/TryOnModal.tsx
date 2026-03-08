import { useState } from 'react';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentImageUrl: string;
}

export default function TryOnModal({ isOpen, onClose, garmentImageUrl }: TryOnModalProps) {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUserImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!userImage) return;
    setIsGenerating(true);
    setResultImage(null);

    try {
      // Create FormData to send user image + garment image reference to our Next.js API
      const formData = new FormData();
      formData.append('userImage', userImage);
      formData.append('garmentImageUrl', garmentImageUrl);

      const response = await fetch('/api/try-on', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success && data.resultUrl) {
        setResultImage(data.resultUrl);
      } else {
        alert('Error generating image');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect to Try-On API');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
          <h2 className="classic-heading text-xl font-bold">Virtual Try-On</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1: User Image */}
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-sm text-neutral-500 uppercase tracking-widest">1. Your Photo</h3>
              <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center relative overflow-hidden group">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Your photo" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-12 w-12 text-neutral-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-neutral-600">Click to upload photo</p>
                    <p className="text-xs text-neutral-400 mt-1">Full body shot recommended</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Step 2: Garment */}
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-sm text-neutral-500 uppercase tracking-widest">2. Selected Item</h3>
              <div className="aspect-[3/4] rounded-xl bg-neutral-100 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={garmentImageUrl} alt="Garment" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>

            {/* Step 3: Result */}
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-sm text-neutral-500 uppercase tracking-widest">3. Result</h3>
              <div className="aspect-[3/4] rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center relative overflow-hidden">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-neutral-800 animate-spin"></div>
                    <p className="text-sm font-medium text-neutral-500 animate-pulse">Generating...</p>
                  </div>
                ) : resultImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultImage} alt="Try-On Result" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <p className="text-sm font-medium text-neutral-400 text-center px-4">
                    Upload your photo and click try-on to see the magic.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-medium text-sm text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={!userImage || isGenerating}
            className={`px-8 py-2.5 rounded-full font-medium text-sm text-white transition-all transform ${!userImage || isGenerating ? 'bg-neutral-300 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800 hover:scale-105 shadow-lg shadow-neutral-900/20'}`}
          >
            {isGenerating ? 'Processing IDM-VTON...' : 'Try It On'}
          </button>
        </div>

      </div>
    </div>
  );
}
