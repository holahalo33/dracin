import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { DramaCardWithRank } from "@/components/DramaCardWithRank";
import { PageLoader } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { searchDramas, Drama } from "@/services/dramaApi";
import { ArrowLeft, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 18;

export default function TagDetail() {
  const { tagName } = useParams<{ tagName: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const decodedTagName = decodeURIComponent(tagName || "");

  const { data: allDramas, isLoading } = useQuery({
    queryKey: ["tag", decodedTagName],
    queryFn: () => searchDramas(decodedTagName),
    enabled: !!decodedTagName,
  });

  // Client-side pagination
  const { paginatedDramas, totalPages, totalItems } = useMemo(() => {
    if (!allDramas || allDramas.length === 0) {
      return { paginatedDramas: [], totalPages: 0, totalItems: 0 };
    }

    const totalItems = allDramas.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedDramas = allDramas.slice(startIndex, endIndex);

    return { paginatedDramas, totalPages, totalItems };
  }, [allDramas, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* Back Link */}
        <Link
          to="/tags"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Semua Tag
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/60 p-3">
              <Tag className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                #{decodedTagName}
              </h1>
              <p className="text-muted-foreground">
                {totalItems > 0 ? `${totalItems} drama ditemukan` : "Drama dengan tag ini"}
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <PageLoader />
        ) : paginatedDramas && paginatedDramas.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
              {paginatedDramas.map((drama: Drama, index: number) => (
                <DramaCardWithRank 
                  key={drama.bookId} 
                  drama={drama} 
                  rank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  showRank={true}
                  size="medium" 
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 py-8">
                {/* Page Info */}
                <p className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages} ({totalItems} drama)
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="gap-1 px-2 sm:px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      typeof page === "number" ? (
                        <Button
                          key={index}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          {page}
                        </Button>
                      ) : (
                        <span key={index} className="px-1 text-muted-foreground">
                          {page}
                        </span>
                      )
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-1 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Tidak ada drama dengan tag "{decodedTagName}"
            </p>
            <Link to="/tags" className="mt-4 inline-block text-primary hover:underline">
              Jelajahi tag lain
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
