import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PageLoader } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDramaDetail, getAllEpisodes } from "@/services/dramaApi";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
  List,
  Info,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface VideoPath {
  quality: number;
  videoPath: string;
  isDefault: number;
}

interface CdnInfo {
  cdnDomain: string;
  isDefault: number;
  videoPathList: VideoPath[];
}

interface Episode {
  chapterId: string;
  chapterName: string;
  chapterIndex: number;
  isCharge?: number;
  cdnList?: CdnInfo[];
  chapterImg?: string;
}

// Helper to get best video URL from episode
function getVideoUrl(episode: Episode | undefined): string {
  if (!episode?.cdnList?.length) return "";
  
  // Find the default CDN or use first one
  const cdn = episode.cdnList.find(c => c.isDefault === 1) || episode.cdnList[0];
  if (!cdn?.videoPathList?.length) return "";
  
  // Find the default quality or use 720p or first available
  const videoPath = 
    cdn.videoPathList.find(v => v.isDefault === 1) ||
    cdn.videoPathList.find(v => v.quality === 720) ||
    cdn.videoPathList[0];
  
  return videoPath?.videoPath || "";
}

export default function Watch() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const episodeParam = searchParams.get("ep");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  const { data: drama, isLoading: dramaLoading } = useQuery({
    queryKey: ["drama", bookId],
    queryFn: () => getDramaDetail(bookId!),
    enabled: !!bookId,
  });

  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ["episodes", bookId],
    queryFn: () => getAllEpisodes(bookId!),
    enabled: !!bookId,
  });

  const episodes: Episode[] = episodesData || [];

  // Set initial episode from URL param
  useEffect(() => {
    if (episodeParam && episodes.length > 0) {
      const index = parseInt(episodeParam, 10) - 1;
      if (index >= 0 && index < episodes.length) {
        setCurrentEpisodeIndex(index);
      }
    }
  }, [episodeParam, episodes.length]);

  // Update URL when episode changes
  useEffect(() => {
    if (episodes.length > 0) {
      setSearchParams({ ep: String(currentEpisodeIndex + 1) });
    }
  }, [currentEpisodeIndex, episodes.length, setSearchParams]);

  const currentEpisode = episodes[currentEpisodeIndex];
  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex < episodes.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  };

  const selectEpisode = (index: number) => {
    setCurrentEpisodeIndex(index);
    setShowEpisodeList(false);
  };

  const isLoading = dramaLoading || episodesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <PageLoader />
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 pt-16">
          <p className="text-lg text-muted-foreground">Drama tidak ditemukan</p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get video URL for current episode
  const currentVideoUrl = useMemo(() => {
    return getVideoUrl(currentEpisode);
  }, [currentEpisode]);

  // Demo fallback if no video URL
  const videoSrc = currentVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-14 sm:pt-16">
        {/* Video Player Section */}
        <div className="relative bg-black">
          <div className="mx-auto max-w-6xl">
            <VideoPlayer
              src={videoSrc}
              poster={currentEpisode?.chapterImg || drama.coverWap}
              title={currentEpisode?.chapterName || drama.bookName}
              episodeNumber={currentEpisodeIndex + 1}
              onPrevious={goToPrevious}
              onNext={goToNext}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              autoPlay
            />
          </div>
        </div>

        {/* Episode Navigation Bar */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={!hasPrevious}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Episode {currentEpisodeIndex + 1} / {episodes.length}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {currentEpisode?.chapterName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={!hasNext}
                className="gap-1"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Daftar Episode</span>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/drama/${bookId}`} className="gap-2">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Info</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Drama Info */}
            <div className="lg:col-span-2">
              <div className="flex gap-4">
                <img
                  src={drama.coverWap}
                  alt={drama.bookName}
                  className="h-32 w-24 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    {drama.bookName}
                  </h1>
                  {drama.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {drama.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {drama.introduction}
                  </p>
                </div>
              </div>
            </div>

            {/* Episode List (Desktop) */}
            <div className="hidden lg:block">
              <h2 className="mb-3 font-semibold">Daftar Episode</h2>
              <ScrollArea className="h-[300px] rounded-lg border border-border bg-card">
                <div className="p-2">
                  {episodes.map((episode, index) => (
                    <button
                      key={episode.chapterId || index}
                      onClick={() => selectEpisode(index)}
                      disabled={episode.isCharge === 1}
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        index === currentEpisodeIndex
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      } ${episode.isCharge === 1 ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="line-clamp-1 text-sm">
                          {episode.chapterName || `Episode ${index + 1}`}
                        </span>
                      </div>
                      {episode.isCharge === 1 ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : index === currentEpisodeIndex ? (
                        <Play className="h-4 w-4 fill-current" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Mobile Episode List (Slide up panel) */}
        {showEpisodeList && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowEpisodeList(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-hidden rounded-t-2xl bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold">Daftar Episode</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEpisodeList(false)}
                >
                  Tutup
                </Button>
              </div>
              <ScrollArea className="h-[60vh]">
                <div className="p-2">
                  {episodes.map((episode, index) => (
                    <button
                      key={episode.chapterId || index}
                      onClick={() => selectEpisode(index)}
                      disabled={episode.isCharge === 1}
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        index === currentEpisodeIndex
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      } ${episode.isCharge === 1 ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="line-clamp-1 text-sm">
                          {episode.chapterName || `Episode ${index + 1}`}
                        </span>
                      </div>
                      {episode.isCharge === 1 ? (
                        <Lock className="h-4 w-4" />
                      ) : index === currentEpisodeIndex ? (
                        <Play className="h-4 w-4 fill-current" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
