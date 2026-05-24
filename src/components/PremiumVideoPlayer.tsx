import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  SkipBack, 
  SkipForward, 
  ArrowRight, 
  HelpCircle, 
  Youtube, 
  HardDrive, 
  Video,
  Gauge,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PremiumVideoPlayerProps {
  videoUrl: string;
  title?: string;
  posterUrl?: string;
}

export default function PremiumVideoPlayer({ videoUrl, title = "Feature Demo Preview", posterUrl }: PremiumVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom Controls enhancements
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Transient center screen hud flashes
  const [flash, setFlash] = useState<{ type: 'play' | 'pause' | 'mute' | 'unmute' | 'speed'; value?: string } | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  // Normalize inputs
  const cleanedUrl = (videoUrl || '').trim();

  // Parse if YouTube Link
  const isYouTube = cleanedUrl.includes('youtube.com') || cleanedUrl.includes('youtu.be');
  
  // Parse if Google Drive Link
  const isDrive = cleanedUrl.includes('drive.google.com') || cleanedUrl.includes('docs.google.com/file');
  
  // Extract YouTube ID
  let youtubeId = '';
  if (isYouTube) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = cleanedUrl.match(regExp);
    if (match && match[2].length === 11) {
      youtubeId = match[2];
    }
  }

  // Extract Google Drive ID
  let driveId = '';
  if (isDrive) {
    try {
      const regExp = /\/file\/d\/([^\/?#]+)/;
      const match = cleanedUrl.match(regExp);
      if (match) {
        driveId = match[1];
      } else {
        const urlObj = new URL(cleanedUrl);
        driveId = urlObj.searchParams.get('id') || '';
      }
    } catch (e) {
      console.error("Failed to parse Google Drive link:", e);
    }
  }

  // Helper to trigger transient central flash HUD
  const triggerFlash = (type: 'play' | 'pause' | 'mute' | 'unmute' | 'speed', value?: string) => {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    setFlash({ type, value });
    flashTimeoutRef.current = setTimeout(() => {
      setFlash(null);
    }, 800);
  };

  // Close speed menu on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // Fullscreen transition change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (isYouTube || isDrive) return; // Managed by embed player
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(pErr => console.log('Autoplay blocked:', pErr));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Double click event to toggle Mute (for Native video only)
  const handleDoubleClickVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isYouTube || isDrive) return; // Managed by official embeds
    toggleMute();
  };

  const toggleMute = () => {
    if (isYouTube || isDrive) return; // Managed by official embeds
    if (videoRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      videoRef.current.muted = nextMuted;
      triggerFlash(nextMuted ? 'mute' : 'unmute');
    }
  };

  // Fast forward 10 seconds
  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
    }
  };

  // Rewind 10 seconds
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  // Full Screen action
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  };

  // Playback rate set
  const handleSpeedSelect = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setIsSpeedOpen(false);
    triggerFlash('speed', `${rate}x`);
  };

  // HTML5 Video Event Listeners
  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Ensure current speed is preserved if metadata reloaded
      videoRef.current.playbackRate = playbackSpeed;
    }
  };

  // Click & Drag on progress track to seek
  const handleScrub = (clientX: number) => {
    if (!progressContainerRef.current || !videoRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
    setProgress(percentage);

    const totalSeconds = duration || 60;
    const targetSeconds = (percentage / 100) * totalSeconds;
    setCurrentTime(targetSeconds);
    videoRef.current.currentTime = targetSeconds;
  };

  const handleMouseDownScrub = (e: React.MouseEvent) => {
    if (isYouTube || isDrive) return; // Managed by official embeds
    setIsDragging(true);
    handleScrub(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleScrub(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration]);

  // Formatting seconds to MM:SS
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Controls Visibility management
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !isDragging && !isSpeedOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isDragging, isSpeedOpen]);

  const speedOptions = [0.5, 1.0, 1.25, 1.5, 2.0];

  return (
    <div 
      ref={containerRef}
      id="premium-custom-player" 
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying && !isDragging && !isSpeedOpen) {
          setIsControlsVisible(false);
        }
      }}
      className={`w-full max-w-4xl mx-auto rounded-3xl bg-slate-950 border border-slate-900 overflow-hidden shadow-2xl transition-all duration-300 group text-left ${
        isFullscreen ? 'fixed inset-0 max-w-none z-[9999] rounded-none border-none h-screen flex flex-col justify-between bg-black' : 'relative shadow-blue-500/5'
      }`}
    >
      
      {/* Player Display Shield */}
      <div className={`relative bg-black flex items-center justify-center overflow-hidden w-full ${isFullscreen ? 'flex-1' : 'aspect-video'}`}>
        
        {/* TRANSIENT FLOATING HUD FLASH NOTIFICATIONS (Elegant Minimalist Icons without overlapping text) */}
        <AnimatePresence>
          {flash && (
            <motion.div 
              key={`${flash.type}-${flash.value || ''}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute z-40 pointer-events-none p-5 rounded-full bg-slate-950/85 text-white border border-slate-800 shadow-2xl backdrop-blur-md flex items-center justify-center w-16 h-16"
            >
              {flash.type === 'play' && <Play className="w-6 h-6 text-emerald-400 fill-emerald-400" />}
              {flash.type === 'pause' && <Pause className="w-6 h-6 text-indigo-400 fill-indigo-400" />}
              {flash.type === 'mute' && <VolumeX className="w-6 h-6 text-red-400" />}
              {flash.type === 'unmute' && <Volume2 className="w-6 h-6 text-emerald-400" />}
              {flash.type === 'speed' && (
                <span className="text-sm font-mono font-bold text-blue-400">{flash.value}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLICKBOARD BOARD FOR NATIVE PLAYBACK GESTURES */}
        {!(isYouTube || isDrive) && (
          <div 
            onClick={handleTogglePlay}
            onDoubleClick={handleDoubleClickVideo}
            className="absolute inset-0 cursor-pointer z-20"
            title="Click to Play/Pause • Double-click to Mute/Unmute"
          />
        )}

        {/* RENDER CHANNELS */}
        {isYouTube && youtubeId ? (
          <div className="absolute inset-0 z-10 scale-[1.00]">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&controls=1`}
              className="w-full h-full border-0 absolute top-0 left-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="YouTube Feature Streaming"
            />
          </div>
        ) : isDrive && driveId ? (
          <div className="absolute inset-0 z-10 scale-[1.00]">
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              className="w-full h-full border-0 absolute top-0 left-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Google Drive Secure Streaming"
            />
          </div>
        ) : cleanedUrl ? (
          <video
            ref={videoRef}
            src={cleanedUrl}
            poster={posterUrl}
            className="w-full h-full object-contain z-10"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            playsInline
            loop
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 z-10">
            <HelpCircle className="w-12 h-12 text-slate-600 animate-pulse" />
            <p className="text-sm font-semibold text-slate-400">Stream Source Not Present</p>
            <p className="text-xs text-slate-500 max-w-sm">Provide a direct MP4/WebM video asset, YouTube link, or public Google Drive link inside the customizer dashboard to streaming previews.</p>
          </div>
        )}

        {/* GORGEOUS GENTLE GLASS PLAY OVERLAY (Only when paused & direct video exists) */}
        {!(isYouTube || isDrive) && !isPlaying && cleanedUrl && (
          <div className="absolute inset-0 z-25 bg-black/20 transition-all flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center"
            >
              <div className="p-3.5 rounded-full bg-blue-600 text-white shadow-lg transition-all">
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </div>
            </motion.div>
          </div>
        )}

        {/* CORE CONTROL DECK BAR OVERLAYED */}
        {!(isYouTube && youtubeId) && (
          <div 
            className={`absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent space-y-3 z-30 transition-all duration-350 transform ${
              isControlsVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
          >
            
            {isDrive && driveId ? (
              /* Sleek Footer Banner for Google Drive Streaming */
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 backdrop-blur-sm">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Google Cloud Drive Video Feed</span>
                    <span className="text-[10px] text-slate-400 font-sans">Full security-scanned streaming bypasses disk read limits. Make sure your Drive file is set to public.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="px-3 py-1 rounded-full bg-indigo-650/40 border border-indigo-500/20 text-[10px] font-medium text-indigo-450 uppercase tracking-wider text-indigo-300">
                    Drive Cloud Source
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-850 text-slate-300 hover:text-white transition-all cursor-pointer hover:bg-slate-850"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              /* PREMIUM NATIVE HTML5 DRAGGABLE PROGRESS TRACKER */
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-300 w-10 text-right select-none">{formatTime(currentTime)}</span>
                  
                  <div 
                    ref={progressContainerRef}
                    onMouseDown={handleMouseDownScrub}
                    className="flex-1 h-1.5 relative rounded-full bg-white/20 hover:bg-white/35 cursor-pointer transition-all duration-300 group/scrub"
                  >
                    {/* Visual Fill Track */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/20"
                      style={{ width: `${progress}%` }}
                    />
                    {/* Visual Draggable Thumb Head */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border border-blue-500 shadow-xl transition-transform scale-0 group-hover/scrub:scale-100"
                      style={{ left: `calc(${progress}% - 7px)` }}
                    />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-300 w-10 select-none">{formatTime(duration)}</span>
                </div>

                {/* BUTTON ACTION CONTAINER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                  <div className="flex items-center flex-wrap gap-2.5 animate-fade-in">
                    <button
                      onClick={handleTogglePlay}
                      className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15 transition-all cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                    </button>

                    {/* REWIND 10S */}
                    <button
                      onClick={handleRewind}
                      className="p-2 rounded-lg bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80 border border-slate-800/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Rewind 10 Seconds"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    {/* FAST FORWARD 10S */}
                    <button
                      onClick={handleFastForward}
                      className="p-2 rounded-lg bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80 border border-slate-800/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Fast Forward 10 Seconds"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* SOUND TOGGLE */}
                    <button
                      onClick={toggleMute}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${isMuted ? 'text-red-400 hover:text-red-300' : 'text-slate-300 hover:text-white'}`}
                      title={isMuted ? "Unmute Audio" : "Mute Audio"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />
                    {/* PLAYBACK SPEED SELECTION POPUP MENU */}
                    <div className="relative" ref={speedMenuRef}>
                      <button
                        onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        title="Playback Speed Selector"
                      >
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        <span>{playbackSpeed === 1.0 ? 'Normal' : `${playbackSpeed}x`}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSpeedOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isSpeedOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-0 mb-2 py-1.5 w-32 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl z-50 overflow-hidden backdrop-blur-md"
                          >
                            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-850 mb-1 select-none">
                              Play Speed
                            </div>
                            {speedOptions.map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handleSpeedSelect(rate)}
                                className={`w-full px-3 py-1.5 text-left text-xs font-medium cursor-pointer flex items-center justify-between transition-all ${
                                  playbackSpeed === rate ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-300 hover:bg-slate-750'
                                }`}
                              >
                                <span>{rate === 1.0 ? '1.0x (Normal)' : `${rate}x`}</span>
                                {playbackSpeed === rate && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  <div className="flex items-center gap-3 ml-auto self-end">
                    {/* FULLSCREEN TRIGGER TOGGLE */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-slate-300 hover:text-white transition-all cursor-pointer hover:bg-slate-800"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
