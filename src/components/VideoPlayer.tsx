import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Loader2,
  Check,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoQuality {
  quality: number;
  videoPath: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  episodeNumber?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  autoPlay?: boolean;
  qualityOptions?: VideoQuality[];
  onQualityChange?: (quality: number) => void;
}

const QUALITY_LABELS: Record<number, string> = {
  144: "144p",
  360: "360p",
  540: "540p",
  720: "720p HD",
  1080: "1080p Full HD",
};

export function VideoPlayer({
  src,
  poster,
  title,
  episodeNumber,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  autoPlay = false,
  qualityOptions = [],
  onQualityChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [currentQuality, setCurrentQuality] = useState<number>(720);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available qualities sorted
  const availableQualities = qualityOptions
    .map((q) => q.quality)
    .sort((a, b) => b - a);

  // Format time as MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause with mobile-friendly error handling
  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          // Reset error state
          setError(null);
          // Use promise-based play for better mobile support
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        }
      } catch (err) {
        console.error("Playback error:", err);
        // On mobile, autoplay might fail - show play button
        setIsPlaying(false);
        setError("Tap to play");
      }
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Set volume
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  // Seek video
  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  // Toggle fullscreen with mobile support
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    const element = containerRef.current as any;
    const doc = document as any;

    if (!isFullscreen) {
      // Try different fullscreen methods for cross-browser/mobile support
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.webkitEnterFullscreen) {
        element.webkitEnterFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (videoRef.current) {
        // iOS Safari fallback - use video element directly
        const video = videoRef.current as any;
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Skip forward/backward
  const skip = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          Math.max(videoRef.current.currentTime + seconds, 0),
          duration
        );
      }
    },
    [duration]
  );

  // Change quality
  const handleQualityChange = useCallback(
    (quality: number) => {
      const savedTime = videoRef.current?.currentTime || 0;
      const wasPlaying = isPlaying;
      
      setCurrentQuality(quality);
      setShowQualityMenu(false);
      
      if (onQualityChange) {
        onQualityChange(quality);
      }
      
      // Restore playback position after quality change
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = savedTime;
          if (wasPlaying) {
            videoRef.current.play().catch(() => {});
          }
        }
      }, 300);
    },
    [isPlaying, onQualityChange]
  );

  // Show controls on touch/mouse
  const handleInteraction = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [isPlaying]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setIsLoading(false);
      setError("Video tidak dapat dimuat. Coba kualitas lain.");
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlay);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("error", handleError);
    video.addEventListener("loadstart", handleLoadStart);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadstart", handleLoadStart);
    };
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(
        !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement)
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "arrowleft":
          skip(-10);
          break;
        case "arrowright":
          skip(10);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    toggleMute,
    toggleFullscreen,
    skip,
    volume,
    handleVolumeChange,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        isFullscreen && "rounded-none"
      )}
      onMouseMove={handleInteraction}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleInteraction}
      onClick={handleInteraction}
    >
      {/* Video Element - Mobile optimized */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain"
        autoPlay={autoPlay}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          <p className="mb-4 text-center text-white">{error}</p>
          <Button
            onClick={togglePlay}
            variant="outline"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && !isLoading && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm transition-transform hover:scale-110 sm:h-20 sm:w-20">
            <Play className="h-8 w-8 fill-current sm:h-10 sm:w-10" />
          </div>
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 transition-opacity duration-300 sm:p-4",
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {/* Title */}
        {title && (
          <div className="mb-2 sm:mb-3">
            <p className="line-clamp-1 text-xs text-white/80 sm:text-sm">
              {episodeNumber && `Ep ${episodeNumber} • `}
              {title}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-2 flex items-center gap-2 sm:mb-3">
          <span className="min-w-[36px] text-[10px] text-white/80 sm:min-w-[40px] sm:text-xs">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1">
            {/* Buffered Progress */}
            <div
              className="absolute h-1 rounded-full bg-white/30"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>
          <span className="min-w-[36px] text-right text-[10px] text-white/80 sm:min-w-[40px] sm:text-xs">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-10"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
              )}
            </Button>

            {/* Previous Episode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPrevious?.();
              }}
              disabled={!hasPrevious}
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white disabled:opacity-30 sm:h-10 sm:w-10"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Next Episode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onNext?.();
              }}
              disabled={!hasNext}
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white disabled:opacity-30 sm:h-10 sm:w-10"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Volume - Hidden on mobile */}
            <div className="hidden items-center gap-1 sm:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="h-10 w-10 text-white hover:bg-white/20 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Quality Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(!showQualityMenu);
                }}
                className="h-8 gap-1 px-2 text-white hover:bg-white/20 hover:text-white sm:h-10 sm:gap-2 sm:px-3"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] font-medium sm:text-xs">
                  {QUALITY_LABELS[currentQuality] || `${currentQuality}p`}
                </span>
              </Button>

              {/* Quality Menu */}
              {showQualityMenu && (
                <div 
                  className="absolute bottom-full right-0 mb-2 min-w-[120px] overflow-hidden rounded-lg border border-white/20 bg-black/95 py-1 shadow-xl sm:min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(availableQualities.length > 0 ? availableQualities : [1080, 720, 540, 360, 144]).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => handleQualityChange(quality)}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs text-white transition-colors hover:bg-white/20 sm:text-sm"
                    >
                      <span>{QUALITY_LABELS[quality] || `${quality}p`}</span>
                      {currentQuality === quality && (
                        <Check className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white sm:h-10 sm:w-10"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Double tap to seek (mobile) */}
      <div className="absolute inset-0 flex">
        <div 
          className="h-full w-1/3"
          onDoubleClick={() => skip(-10)}
        />
        <div 
          className="h-full w-1/3"
          onDoubleClick={togglePlay}
        />
        <div 
          className="h-full w-1/3"
          onDoubleClick={() => skip(10)}
        />
      </div>
    </div>
  );
}
