import React, { useState, useEffect, useRef } from 'react';
import { Upload, Clipboard, Check, Copy, AlertCircle, RefreshCw, Eye, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploaderProps {
  onUploadSuccess?: (url: string) => void;
  label?: string;
  className?: string;
  presetUrl?: string;
  compact?: boolean;
  clearOnSuccess?: boolean;
  historyKey?: string;
}

export default function ImageUploader({ 
  onUploadSuccess, 
  label, 
  className = "", 
  presetUrl, 
  compact = false,
  clearOnSuccess = false,
  historyKey
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(presetUrl || null);
  const [copied, setCopied] = useState(false);
  const [recentUploads, setRecentUploads] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey || 'post_status_recent_uploads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync preset Url
  useEffect(() => {
    if (presetUrl) {
      setResultUrl(presetUrl);
    }
  }, [presetUrl]);

  // Save recent uploads to localStorage for persistence across reloads
  useEffect(() => {
    try {
      localStorage.setItem(historyKey || 'post_status_recent_uploads', JSON.stringify(recentUploads));
    } catch (e) {
      console.warn("Storage write failed.", e);
    }
  }, [recentUploads, historyKey]);

  // Listener to intercept Ctrl+V image pastes in a scoped manner
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      
      // Strict scope check: only handle the paste if the mouse hover, current target, 
      // or focused element is inside this specific component's container element
      const isInside = containerRef.current && (
        containerRef.current.contains(document.activeElement) ||
        containerRef.current.contains(e.target as Node)
      );
      
      if (!isInside) return;
      
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadFileToImgBB(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePasteEvent);
    return () => {
      window.removeEventListener('paste', handlePasteEvent);
    };
  }, []);

  const uploadFileToImgBB = async (file: File) => {
    if (!file) return;
    
    // Check if it is an image
    if (!file.type.startsWith('image/')) {
      setUploadError("Only image file formats are supported.");
      return;
    }

    setLoading(true);
    setUploadError(null);
    setCopied(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use the provided raw ImgBB API key, support environment overrides
      const apiKey = (import.meta as any).env?.VITE_IMGBB_API_KEY || '31eccf73e0bcc32447085894228cc64e';
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ImgBB returned HTTP ${response.status} Error`);
      }

      const data = await response.json();
      
      if (data && data.success && data.data && data.data.url) {
        const directUrl = data.data.url;
        if (clearOnSuccess) {
          setResultUrl(null);
        } else {
          setResultUrl(directUrl);
        }
        setRecentUploads(prev => {
          const filtered = prev.filter(item => item !== directUrl);
          return [directUrl, ...filtered].slice(0, 8); // Keep last 8 images
        });
        
        if (onUploadSuccess) {
          onUploadSuccess(directUrl);
        }
      } else {
        throw new Error(data?.error?.message || "Parsing of ImgBB API response failed.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "An expected error happened while uploading to ImgBB.");
      console.error("ImgBB upload failed: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileToImgBB(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFileToImgBB(e.target.files[0]);
    }
  };

  const copyToClipboard = () => {
    if (!resultUrl) return;
    navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onZoneClick = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResultUrl(null);
    if (onUploadSuccess) {
      onUploadSuccess('');
    }
  };

  const deleteRecentItem = (urlToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentUploads(prev => prev.filter(url => url !== urlToDelete));
  };

  return (
    <div className={`space-y-3.5 ${className}`} ref={containerRef}>
      {label && (
        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      )}

      {/* Drag & Drop Main Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onZoneClick}
        className={`relative rounded-2xl transition-all duration-300 ${
          compact ? 'border border-dashed p-3' : 'border-2 border-dashed p-6 text-center shadow-lg shadow-black/10'
        } ${
          dragActive 
            ? 'border-blue-500 bg-blue-500/5 shadow-blue-500/5' 
            : resultUrl 
              ? 'border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20' 
              : 'border-slate-800 bg-slate-900/10 hover:border-slate-800/70 hover:bg-slate-900/20'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex flex-col items-center justify-center space-y-1.5 ${compact ? 'py-1' : 'py-6 space-y-3'}`}
            >
              <div className="p-1.5 bg-blue-500/10 rounded-full text-blue-400 animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-semibold text-white">Uploading to secure server...</p>
            </motion.div>
          ) : resultUrl ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-left"
              onClick={(e) => e.stopPropagation()} // Stop click on widget from triggering file chooser
            >
              {compact ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="relative group w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-lg shrink-0">
                    <img 
                      src={resultUrl} 
                      alt="Uploaded Asset" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <a 
                      href={resultUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      title="View full image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Image
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-medium truncate max-w-[220px]" title={resultUrl}>
                      {resultUrl.split('/').pop() || 'uploaded_image.png'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={onZoneClick}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-slate-900 border border-slate-800/80 text-slate-350 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        Replace Image
                      </button>
                      <button
                        type="button"
                        onClick={clearUpload}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 text-rose-450 rounded-lg transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-5 p-2 items-center">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/60 shrink-0 relative group">
                    <img 
                      src={resultUrl} 
                      alt="Uploaded Asset" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <a 
                      href={resultUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Uploaded</span>
                      <button 
                        onClick={clearUpload}
                        className="p-1 px-1.5 hover:bg-red-500/15 hover:text-red-400 text-slate-500 border border-transparent hover:border-red-500/20 rounded font-semibold text-[9px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Clear
                      </button>
                    </div>
                    
                    <div className="flex bg-slate-950 border border-slate-800/60 rounded-xl overflow-hidden p-0.5 shadow-inner">
                      <span className="flex-1 font-mono text-[10px] text-slate-450 px-2 py-1.5 truncate select-all">
                        {resultUrl}
                      </span>
                      <button 
                        onClick={copyToClipboard}
                        className={`px-2 py-1 rounded-lg flex items-center justify-center gap-1 text-[10px] font-semibold transition-all shrink-0 ${copied ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'}`}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="uploader-idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex items-center ${compact ? 'py-1.5 justify-center gap-2 text-slate-400 group hover:text-blue-400 transition-colors' : 'flex-col py-4 space-y-2'}`}
            >
              <div className={`${compact ? 'w-7 h-7 rounded-lg' : 'w-12 h-12 rounded-full mb-2'} bg-slate-900/40 border border-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors shrink-0`}>
                <Upload className="w-4 h-4" />
              </div>
              <div className={compact ? "text-left" : "space-y-1 text-center"}>
                <p className="text-xs font-semibold text-slate-300">
                  {compact ? (
                    <span>Click or drop logo to upload</span>
                  ) : (
                    <span>
                      Drag and drop, paste <kbd className="bg-slate-900 px-1 py-0.5 rounded text-[10px] border border-slate-800 font-mono text-slate-400">Ctrl+V</kbd> or <span className="text-blue-400 group-hover:text-blue-300 underline underline-offset-2">browse files</span>
                    </span>
                  )}
                </p>
                {!compact && <p className="text-xs text-slate-500">Supports PNG, JPG, JPEG, GIF, SVG or WEBP (Max 32MB)</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {uploadError && (
          <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 flex items-center gap-1.5 text-left justify-center">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Clipboard paste utility notice */}
      {!resultUrl && !loading && !compact && (
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 text-center font-medium">
          <Clipboard className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
          <span>Need magic? Try copying any snapshot from your clipboard and paste (<kbd className="font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1 rounded">Ctrl+V</kbd>) here!</span>
        </p>
      )}

      {/* Recent Uploads Row (Session history) */}
      {recentUploads.length > 0 && (
        <div className={`space-y-1.5 pt-2 border-t border-slate-900/40 text-left`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-slate-550" />
              Recent uploads
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1">
            {recentUploads.map((url, index) => (
              <div 
                key={`${url}-${index}`}
                onClick={() => {
                  setResultUrl(url);
                  if (onUploadSuccess) onUploadSuccess(url);
                }}
                className={`group relative ${compact ? 'w-8 h-8 rounded-md' : 'w-12 h-12 rounded-lg'} border bg-slate-950 overflow-hidden cursor-pointer transition-all ${resultUrl === url ? 'border-blue-500 scale-105' : 'border-slate-850 hover:border-slate-800'}`}
                title="Click to apply this link"
              >
                <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {!compact && (
                  <button 
                    onClick={(e) => deleteRecentItem(url, e)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950 hover:bg-red-500 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove from history"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
