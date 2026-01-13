import { Drama } from "@/services/dramaApi";
import { DramaCard } from "./DramaCard";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

interface DramaRowProps {
  title: string;
  subtitle?: string;
  dramas: Drama[];
  size?: "small" | "medium" | "large";
  categoryLink?: string;
}

export function DramaRow({
  title,
  subtitle,
  dramas,
  size = "medium",
  categoryLink,
}: DramaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!dramas || dramas.length === 0) return null;

  return (
    <section className="relative py-4 sm:py-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4 sm:mb-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-bold text-foreground sm:text-xl lg:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {categoryLink && (
          <Link
            to={categoryLink}
            className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80 sm:text-sm"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Scrollable Row */}
      <div className="group relative">
        {/* Left Gradient */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent sm:w-12" />

        {/* Right Gradient */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent sm:w-12" />

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto px-4 sm:gap-4 sm:px-6 lg:px-8"
        >
          {dramas.map((drama) => (
            <DramaCard key={drama.bookId} drama={drama} size={size} />
          ))}
        </div>
      </div>
    </section>
  );
}
