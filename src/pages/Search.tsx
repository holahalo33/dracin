import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { DramaCardWithRank } from "@/components/DramaCardWithRank";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { searchDramas, getPopularSearch, getTrending, Drama } from "@/services/dramaApi";
import { 
  Search as SearchIcon, 
  ArrowLeft, 
  TrendingUp, 
  Filter,
  X,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

type SortOption = "relevance" | "episodes_high" | "episodes_low" | "name_asc" | "name_desc";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "relevance", label: "Relevansi", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "episodes_high", label: "Episode Terbanyak", icon: <SortDesc className="h-4 w-4" /> },
  { value: "episodes_low", label: "Episode Tersedikit", icon: <SortAsc className="h-4 w-4" /> },
  { value: "name_asc", label: "Nama A-Z", icon: <SortAsc className="h-4 w-4" /> },
  { value: "name_desc", label: "Nama Z-A", icon: <SortDesc className="h-4 w-4" /> },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [episodeRange, setEpisodeRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchDramas(query),
    enabled: query.length > 0,
  });

  const { data: popularSearches } = useQuery({
    queryKey: ["popularSearch"],
    queryFn: getPopularSearch,
  });

  // Fetch trending to get popular tags
  const { data: trendingData } = useQuery({
    queryKey: ["trending-for-tags"],
    queryFn: () => getTrending(1),
  });

  // Extract available tags from results and trending
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    
    results?.forEach((drama: Drama) => {
      const tags = drama.tags || drama.tagNames || [];
      tags.forEach((tag) => tagSet.add(tag));
    });
    
    trendingData?.forEach((drama: Drama) => {
      const tags = drama.tags || drama.tagNames || [];
      tags.forEach((tag) => tagSet.add(tag));
    });
    
    return Array.from(tagSet).sort();
  }, [results, trendingData]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!results) return [];
    
    let filtered = results.filter((drama: Drama) => {
      // Episode count filter
      const episodes = drama.chapterCount || 0;
      if (episodes < episodeRange[0] || episodes > episodeRange[1]) {
        return false;
      }
      
      // Tag filter
      if (selectedTags.length > 0) {
        const dramaTags = drama.tags || drama.tagNames || [];
        if (!selectedTags.some((tag) => dramaTags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
    
    // Sort
    switch (sortBy) {
      case "episodes_high":
        filtered.sort((a, b) => (b.chapterCount || 0) - (a.chapterCount || 0));
        break;
      case "episodes_low":
        filtered.sort((a, b) => (a.chapterCount || 0) - (b.chapterCount || 0));
        break;
      case "name_asc":
        filtered.sort((a, b) => a.bookName.localeCompare(b.bookName));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.bookName.localeCompare(a.bookName));
        break;
      default:
        // Keep original order (relevance)
        break;
    }
    
    return filtered;
  }, [results, selectedTags, episodeRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const handlePopularClick = (term: string) => {
    setInputValue(term);
    setSearchParams({ q: term });
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) 
        ? prev.filter((t) => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setEpisodeRange([0, 200]);
    setSortBy("relevance");
  };

  const hasActiveFilters = selectedTags.length > 0 || episodeRange[0] > 0 || episodeRange[1] < 200 || sortBy !== "relevance";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari drama favorit kamu..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-14 pl-12 pr-4 text-lg"
            />
          </div>
        </form>

        {/* Filter & Sort Bar */}
        {query && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  !
                </Badge>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="gap-2"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.icon}
                <span className="hidden sm:inline">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showSortMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${
                        sortBy === option.value ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1"
              >
                {tag}
                <button onClick={() => handleTagSelect(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && query && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Episode Count Filter */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-4 w-4 text-primary" />
                  Jumlah Episode
                </h3>
                <div className="px-2">
                  <Slider
                    value={episodeRange}
                    min={0}
                    max={200}
                    step={5}
                    onValueChange={(value) => setEpisodeRange(value as [number, number])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{episodeRange[0]} episode</span>
                    <span>{episodeRange[1]}+ episode</span>
                  </div>
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4 text-primary" />
                  Filter Tag
                </h3>
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                  {availableTags.slice(0, 20).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                        selectedTags.includes(tag)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {availableTags.length > 20 && (
                  <Link to="/tags" className="mt-2 inline-block text-xs text-primary hover:underline">
                    Lihat semua tag →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {!query && popularSearches && popularSearches.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Pencarian Populer
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePopularClick(term)}
                  className="rounded-full"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Hasil pencarian untuk "{query}"
              </h2>
              {filteredResults && (
                <span className="text-sm text-muted-foreground">
                  {filteredResults.length} drama ditemukan
                </span>
              )}
            </div>

            {isLoading ? (
              <LoadingSpinner text="Mencari..." />
            ) : filteredResults && filteredResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 pb-8 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
                {filteredResults.map((drama: Drama, index: number) => (
                  <DramaCardWithRank 
                    key={drama.bookId} 
                    drama={drama} 
                    rank={sortBy === "episodes_high" || sortBy === "episodes_low" ? index + 1 : undefined}
                    showRank={sortBy === "episodes_high" || sortBy === "episodes_low"}
                    size="medium" 
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {hasActiveFilters 
                    ? "Tidak ada hasil dengan filter ini"
                    : `Tidak ada hasil untuk "${query}"`}
                </p>
                {hasActiveFilters ? (
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Reset filter
                  </Button>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Coba kata kunci lain
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Tag Browse (when no query) */}
        {!query && availableTags.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Tag className="h-5 w-5 text-primary" />
              Jelajahi Tag
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 15).map((tag) => (
                <Link
                  key={tag}
                  to={`/tag/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
              <Link
                to="/tags"
                className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Lihat Semua →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
