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

// Helper to get video URL for a specific quality
function getVideoUrl(episode: Episode | undefined, quality: number): string {
  if (!episode?.cdnList?.length) return "";

  // Find the default CDN or use first one
  const cdn =
    episode.cdnList.find((c) => c.isDefault === 1) || episode.cdnList[0];
  if (!cdn?.videoPathList?.length) return "";

  // Find the requested quality, or fallback to default/first available
  const videoPath =
    cdn.videoPathList.find((v) => v.quality === quality) ||
    cdn.videoPathList.find((v) => v.isDefault === 1) ||
    cdn.videoPathList[0];

  return videoPath?.videoPath || "";
}

// Helper to get all available qualities
function getAvailableQualities(episode: Episode | undefined): VideoPath[] {
  if (!episode?.cdnList?.length) return [];

  const cdn =
    episode.cdnList.find((c) => c.isDefault === 1) || episode.cdnList[0];
  return cdn?.videoPathList || [];
}

export default function Watch() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const episodeParam = searchParams.get("ep");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(720);

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

  // Initialize episode index from URL param ONLY ONCE when episodes load
  useEffect(() => {
    if (episodes.length > 0 && currentEpisodeIndex === null) {
      if (episodeParam) {
        const index = parseInt(episodeParam, 10) - 1;
        if (index >= 0 && index < episodes.length) {
          setCurrentEpisodeIndex(index);
        } else {
          setCurrentEpisodeIndex(0);
        }
      } else {
        setCurrentEpisodeIndex(0);
      }
    }
  }, [episodes.length, episodeParam, currentEpisodeIndex]);

  // Actual episode index to use (default to 0 if null)
  const activeEpisodeIndex = currentEpisodeIndex ?? 0;

  const currentEpisode = episodes[activeEpisodeIndex];
  const hasPrevious = activeEpisodeIndex > 0;
  const hasNext = activeEpisodeIndex < episodes.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      const newIndex = activeEpisodeIndex - 1;
      setCurrentEpisodeIndex(newIndex);
      setSearchParams({ ep: String(newIndex + 1) }, { replace: true });
    }
  };

  const goToNext = () => {
    if (hasNext) {
      const newIndex = activeEpisodeIndex + 1;
      setCurrentEpisodeIndex(newIndex);
      setSearchParams({ ep: String(newIndex + 1) }, { replace: true });
    }
  };

  const selectEpisode = (index: number) => {
    setCurrentEpisodeIndex(index);
    setSearchParams({ ep: String(index + 1) }, { replace: true });
    setShowEpisodeList(false);
  };

  const isLoading = dramaLoading || episodesLoading;

  // Get video URL for current episode and quality
  const currentVideoUrl = useMemo(() => {
    return getVideoUrl(currentEpisode, currentQuality);
  }, [currentEpisode, currentQuality]);

  // Get available qualities
  const qualityOptions = useMemo(() => {
    return getAvailableQualities(currentEpisode);
  }, [currentEpisode]);

  // Demo fallback if no video URL
  const videoSrc =
    currentVideoUrl ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

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
              episodeNumber={activeEpisodeIndex + 1}
              onPrevious={goToPrevious}
              onNext={goToNext}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              autoPlay
              qualityOptions={qualityOptions}
              onQualityChange={setCurrentQuality}
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
                  Episode {activeEpisodeIndex + 1} / {episodes.length}
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
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
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
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        index === activeEpisodeIndex
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="line-clamp-1 text-sm">
                          {episode.chapterName || `Episode ${index + 1}`}
                        </span>
                      </div>
                      {index === activeEpisodeIndex && (
                        <Play className="h-4 w-4 fill-current" />
                      )}
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
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                        index === activeEpisodeIndex
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="line-clamp-1 text-sm">
                          {episode.chapterName || `Episode ${index + 1}`}
                        </span>
                      </div>
                      {index === activeEpisodeIndex && (
                        <Play className="h-4 w-4 fill-current" />
                      )}
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
