import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDramaDetail, getAllEpisodes } from "@/services/dramaApi";
import {
  Play,
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  Film,
  Star,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function DramaDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const { data: drama, isLoading } = useQuery({
    queryKey: ["drama", bookId],
    queryFn: () => getDramaDetail(bookId!),
    enabled: !!bookId,
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", bookId],
    queryFn: () => getAllEpisodes(bookId!),
    enabled: !!bookId,
  });

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

  const displayedEpisodes = showAllEpisodes
    ? episodes
    : episodes?.slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative min-h-[60vh] pt-14 sm:pt-16">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={drama.coverWap}
            alt={drama.bookName}
            className="h-full w-full object-cover object-top opacity-30 blur-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <div className="relative aspect-[2/3] w-40 overflow-hidden rounded-xl shadow-2xl sm:w-52 lg:w-64">
                <img
                  src={drama.coverWap}
                  alt={drama.bookName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                {drama.bookName}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {drama.playCount && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {drama.playCount}
                  </span>
                )}
                {drama.chapterCount && (
                  <span className="flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    {drama.chapterCount} Episode
                  </span>
                )}
                {drama.status && (
                  <Badge variant="secondary">{drama.status}</Badge>
                )}
              </div>

              {/* Tags */}
              {drama.tags && drama.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {drama.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              {drama.introduction && (
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {drama.introduction}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to={`/watch/${drama.bookId}`}>
                    <Play className="h-5 w-5 fill-current" />
                    Tonton Sekarang
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">
          Daftar Episode
        </h2>

        {episodes && episodes.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEpisodes?.map((episode: any, index: number) => (
              <Link
                key={episode.chapterId || index}
                to={`/watch/${bookId}?ep=${index + 1}`}
                className="group flex items-center justify-between rounded-lg bg-card p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {index + 1}
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {episode.chapterName || `Episode ${index + 1}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>~5 min</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-card p-8 text-center">
            <Film className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Episode akan segera tersedia
            </p>
          </div>
        )}

        {episodes && episodes.length > 12 && !showAllEpisodes && (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setShowAllEpisodes(true)}
          >
            Lihat Semua {episodes.length} Episode
          </Button>
        )}
      </div>
    </div>
  );
}
