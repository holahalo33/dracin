import { Drama } from "@/services/dramaApi";
import { Play, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  drama: Drama | null;
}

export function HeroBanner({ drama }: HeroBannerProps) {
  if (!drama) {
    return (
      <div className="relative h-[50vh] min-h-[400px] animate-pulse bg-muted sm:h-[60vh] lg:h-[70vh]" />
    );
  }

  return (
    <div className="relative h-[50vh] min-h-[400px] overflow-hidden sm:h-[60vh] lg:h-[70vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={drama.coverWap}
          alt={drama.bookName}
          className="h-full w-full object-cover object-top"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full items-end pb-12 sm:items-center sm:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-4">
            {/* Tags */}
            {drama.tags && (
              <div className="flex flex-wrap gap-2">
                {drama.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {drama.bookName}
            </h1>

            {/* Description */}
            {drama.introduction && (
              <p className="line-clamp-3 text-sm text-muted-foreground sm:text-base">
                {drama.introduction}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {drama.playCount && <span>{drama.playCount} Ditonton</span>}
              {drama.chapterCount && <span>{drama.chapterCount} Episode</span>}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link to={`/drama/${drama.bookId}`}>
                  <Play className="h-5 w-5 fill-current" />
                  Tonton Sekarang
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to={`/drama/${drama.bookId}`}>
                  <Info className="h-5 w-5" />
                  Info Lainnya
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
