import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, ArrowRight, HelpCircle, Youtube, HardDrive, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PremiumVideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export default function PremiumVideoPlayer({ videoUrl, title = "Feature Demo Preview" }: PremiumVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showStatusBadge, setShowStatusBadge] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

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

  // Effect to clean up status overlay animations
  useEffect(() => {
    if (showStatusBadge) {
      const timer = setTimeout(() => setShowStatusBadge(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [showStatusBadge]);

  // Toggle Play / Pause (for Native video only)
  const handleTogglePlay = () => {
    if (isYouTube || isDrive) return; // Managed by official embeds
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setShowStatusBadge('PAUSE');
      } else {
        videoRef.current.play().catch(e => console.log('Autoplay blocked: ', e));
        setShowStatusBadge('PLAY');
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
      setShowStatusBadge(nextMuted ? 'MUTED' : 'UNMUTED');
    }
  };

  // Fast forward 10 seconds (for Native video)
  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
      setShowStatusBadge('+10s');
    }
  };

  // Rewind 10 seconds (for Native video)
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
      setShowStatusBadge('-10s');
    }
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
    }
  };

  // Click on scrubbing track to seek (for Native video)
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

  return (
    <div id="premium-custom-player" className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-950 border border-slate-900 overflow-hidden shadow-2xl shadow-blue-500/5 group text-left">
      
      {/* Player Display Shield */}
      <div className="relative aspect-video bg-black/95 flex items-center justify-center overflow-hidden">
        
        {/* BIG STATUS BADGE NOTIFICATION (HTML5 Native Only) */}
        {!(isYouTube || isDrive) && (
          <AnimatePresence>
            {showStatusBadge && (
              <motion.div 
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute z-30 pointer-events-none px-6 py-3 rounded-full bg-slate-950/90 text-white border border-slate-800 text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-2xl shadow-black"
              >
                {showStatusBadge === 'PLAY' && <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
                {showStatusBadge === 'PAUSE' && <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />}
                {showStatusBadge === 'MUTED' && <VolumeX className="w-4 h-4 text-red-400" />}
                {showStatusBadge === 'UNMUTED' && <Volume2 className="w-4 h-4 text-emerald-400" />}
                {['+10s', '-10s'].includes(showStatusBadge) && <SkipForward className="w-4 h-4 text-blue-400" />}
                <span>{showStatusBadge}</span>
              </motion.div>
            )}
          </AnimatePresence>
        )}

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

        {/* OVERLAYS WHILE IDLE (Native Video Only) */}
        {!(isYouTube || isDrive) && !isPlaying && cleanedUrl && (
          <div className="absolute inset-0 z-15 bg-black/40 backdrop-blur-[2px] transition-all flex items-center justify-center pointer-events-none">
            <div className="p-5 rounded-full bg-blue-600/90 text-white shadow-xl shadow-blue-500/20 scale-100 group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </div>
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-slate-950/80 border border-slate-900 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Immersive Custom Video Engine
            </div>
          </div>
        )}
      </div>

      {/* CORE CONTROL DECK BAR */}
      <div className="p-4 bg-slate-950 border-t border-slate-900 space-y-3 relative z-30">
        
        {isYouTube && youtubeId ? (
          /* Sleek Footer Banner for YouTube Broadcast */
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">YouTube Public Broadcast Stream</span>
                <span className="text-[10px] text-slate-500">Enhanced full interactions loaded dynamically. Supports YouTube native controls.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-450 uppercase tracking-wider">
                Active External Sync
              </span>
            </div>
          </div>
        ) : isDrive && driveId ? (
          /* Sleek Footer Banner for Google Drive Streaming */
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Google Cloud Drive Video Feed</span>
                <span className="text-[10px] text-slate-500 font-sans">Full security-scanned streaming bypasses disk read limits. Make sure your Drive file is set to public.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-605/10 border border-indigo-505/20 text-[10px] font-medium text-indigo-400 uppercase tracking-wider">
                Drive Cloud Source
              </span>
            </div>
          </div>
        ) : (
          /* PREMIUM NATIVE HTML5 DRAGGABLE PROGRESS TRACKER */
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500 w-10 text-right">{formatTime(currentTime)}</span>
              
              <div 
                ref={progressContainerRef}
                onMouseDown={handleMouseDownScrub}
                className="flex-1 h-2 relative rounded-full bg-slate-900 hover:bg-slate-850 cursor-pointer transition-all duration-300 group/scrub"
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

              <span className="text-[10px] font-mono text-slate-500 w-10">{formatTime(duration)}</span>
            </div>

            {/* BUTTON ACTION CONTAINER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={handleTogglePlay}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15 transition-all cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                </button>

                {/* REWIND 10S */}
                <button
                  onClick={handleRewind}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Rewind 10 Seconds"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                {/* FAST FORWARD 10S */}
                <button
                  onClick={handleFastForward}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Fast Forward 10 Seconds"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
                
                {/* SOUND TOGGLE */}
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${isMuted ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white'}`}
                  title={isMuted ? "Unmute Audio" : "Mute Audio (Double click video screen to also toggle)"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-[10px] font-sans text-slate-500 leading-snug">
                  <span className="font-semibold text-slate-300 uppercase block tracking-wide">Custom HTML5 Direct Playback</span>
                  Double-click screen to mute
                </div>
                
                <span className="px-2.5 py-1 rounded bg-slate-900/40 border border-slate-900 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-emerald-400" /> Direct File
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
