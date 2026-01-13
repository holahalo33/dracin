import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { DramaCard } from "@/components/DramaCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { searchDramas, getPopularSearch } from "@/services/dramaApi";
import { Search as SearchIcon, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchDramas(query),
    enabled: query.length > 0,
  });

  const { data: popularSearches } = useQuery({
    queryKey: ["popularSearch"],
    queryFn: getPopularSearch,
  });

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
        <form onSubmit={handleSearch} className="mb-8">
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
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Hasil pencarian untuk "{query}"
            </h2>

            {isLoading ? (
              <LoadingSpinner text="Mencari..." />
            ) : results && results.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
                {results.map((drama) => (
                  <DramaCard key={drama.bookId} drama={drama} size="medium" />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Tidak ada hasil untuk "{query}"
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba kata kunci lain
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
