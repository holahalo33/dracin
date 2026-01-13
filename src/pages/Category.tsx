import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { DramaCardWithRank } from "@/components/DramaCardWithRank";
import { TagFilter } from "@/components/TagFilter";
import { PageLoader } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  getTrending,
  getLatest,
  getForYou,
  getRandom,
  getDubIndo,
  Drama,
} from "@/services/dramaApi";
import { 
  ArrowLeft, 
  Flame, 
  Sparkles, 
  Clock, 
  Shuffle, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  List,
  Trophy
} from "lucide-react";

const categoryConfig: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    fetcher: (page: number) => Promise<Drama[]>;
    showRank?: boolean;
  }
> = {
  trending: {
    title: "Trending",
    subtitle: "Drama paling populer saat ini",
    icon: <Flame className="h-6 w-6 text-orange-500" />,
    fetcher: getTrending,
    showRank: true,
  },
  latest: {
    title: "Terbaru",
    subtitle: "Drama yang baru ditambahkan",
    icon: <Clock className="h-6 w-6 text-blue-500" />,
    fetcher: getLatest,
  },
  foryou: {
    title: "Untukmu",
    subtitle: "Rekomendasi berdasarkan selera kamu",
    icon: <Sparkles className="h-6 w-6 text-pink-500" />,
    fetcher: getForYou,
  },
  random: {
    title: "Random",
    subtitle: "Drama pilihan acak untuk kamu",
    icon: <Shuffle className="h-6 w-6 text-green-500" />,
    fetcher: getRandom,
  },
  dubindo: {
    title: "Dubbing Indonesia",
    subtitle: "Drama dengan dubbing Bahasa Indonesia",
    icon: <Globe className="h-6 w-6 text-red-500" />,
    fetcher: getDubIndo,
  },
};

type ViewMode = "grid" | "list";

export default function Category() {
  const { type } = useParams<{ type: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const config = categoryConfig[type || "trending"];

  const { data: dramas, isLoading, isFetching } = useQuery({
    queryKey: ["category", type, currentPage],
    queryFn: () => config?.fetcher(currentPage) || getTrending(currentPage),
    enabled: !!config,
  });

  // Extract all unique tags from dramas
  const availableTags = useMemo(() => {
    if (!dramas) return [];
    const tagSet = new Set<string>();
    dramas.forEach((drama: Drama) => {
      const tags = drama.tags || drama.tagNames || [];
      tags.forEach((tag) => tagSet.add(tag));
      drama.tagV3s?.forEach((tagV3) => tagSet.add(tagV3.tagName));
    });
    return Array.from(tagSet).sort();
  }, [dramas]);

  // Filter dramas by selected tags
  const filteredDramas = useMemo(() => {
    if (!dramas || selectedTags.length === 0) return dramas;
    return dramas.filter((drama: Drama) => {
      const dramaTags = drama.tags || drama.tagNames || [];
      const tagV3Names = drama.tagV3s?.map((t) => t.tagName) || [];
      const allDramaTags = [...dramaTags, ...tagV3Names];
      return selectedTags.some((tag) => allDramaTags.includes(tag));
    });
  }, [dramas, selectedTags]);

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 pt-16">
          <p className="text-lg text-muted-foreground">
            Kategori tidak ditemukan
          </p>
          <Link to="/" className="text-primary hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* Back Link */}
        <Link
          to="/categories"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kategori
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {config.icon}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {config.title}
                </h1>
                {config.showRank && (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <p className="text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-1"
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <TagFilter
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onTagRemove={handleTagRemove}
            onClearAll={handleClearAllTags}
          />
        )}

        {/* Results Count */}
        {filteredDramas && (
          <div className="mb-4 text-sm text-muted-foreground">
            Menampilkan {filteredDramas.length} drama
            {selectedTags.length > 0 && ` dengan filter tag`}
          </div>
        )}

        {/* Grid/List View */}
        {isLoading ? (
          <PageLoader />
        ) : filteredDramas && filteredDramas.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className={`grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 ${isFetching ? "opacity-50" : ""}`}>
                {filteredDramas.map((drama: Drama, index: number) => (
                  <DramaCardWithRank 
                    key={drama.bookId} 
                    drama={drama} 
                    rank={config.showRank ? index + 1 + (currentPage - 1) * 20 : undefined}
                    showRank={config.showRank}
                    size="medium" 
                  />
                ))}
              </div>
            ) : (
              <div className={`space-y-4 ${isFetching ? "opacity-50" : ""}`}>
                {filteredDramas.map((drama: Drama, index: number) => (
                  <DramaListItem 
                    key={drama.bookId} 
                    drama={drama} 
                    rank={config.showRank ? index + 1 + (currentPage - 1) * 20 : undefined}
                    showRank={config.showRank}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 py-8">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isFetching}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Halaman {currentPage}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={isFetching || (dramas && dramas.length < 10)}
                className="gap-2"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {selectedTags.length > 0
                ? "Tidak ada drama dengan filter tag ini"
                : currentPage > 1 
                  ? "Tidak ada drama lagi di halaman ini" 
                  : "Tidak ada drama di kategori ini"}
            </p>
            {(currentPage > 1 || selectedTags.length > 0) && (
              <Button
                variant="link"
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedTags([]);
                }}
                className="mt-2"
              >
                Reset filter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// List Item Component
function DramaListItem({ 
  drama, 
  rank, 
  showRank 
}: { 
  drama: Drama; 
  rank?: number; 
  showRank?: boolean;
}) {
  const coverImage = drama.coverWap || drama.cover || drama.bookCover || "";
  const dramaTags = drama.tags || drama.tagNames || [];

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-600 text-yellow-900";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-700 text-orange-900";
    return "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground";
  };

  return (
    <Link
      to={`/drama/${drama.bookId}`}
      className="group flex gap-4 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Rank */}
      {showRank && rank && (
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${getRankStyle(rank)}`}>
          {rank}
        </div>
      )}

      {/* Cover */}
      <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={coverImage}
          alt={drama.bookName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {drama.rankVo && (
          <div className="absolute right-0 top-0 flex items-center gap-0.5 rounded-bl-lg bg-gradient-to-r from-red-500 to-orange-500 px-1 py-0.5 text-[8px] font-semibold text-white">
            <Flame className="h-2 w-2" />
            {drama.rankVo.hotCode}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center">
        <h3 className="line-clamp-1 font-medium text-foreground transition-colors group-hover:text-primary">
          {drama.bookName}
        </h3>
        <p className="line-clamp-2 mt-1 text-xs text-muted-foreground">
          {drama.introduction}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {dramaTags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {drama.chapterCount && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              {drama.chapterCount} Episode
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
