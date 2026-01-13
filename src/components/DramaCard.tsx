import { Drama } from "@/services/dramaApi";
import { Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface DramaCardProps {
  drama: Drama;
  size?: "small" | "medium" | "large";
}

export function DramaCard({ drama, size = "medium" }: DramaCardProps) {
  // Handle coverWap, cover (search API), and bookCover (random API)
  const coverImage = drama.coverWap || drama.cover || drama.bookCover || "";
  // Handle both tags and tagNames (search API uses 'tagNames')
  const dramaTags = drama.tags || drama.tagNames || [];

  const sizeClasses = {
    small: "w-28 sm:w-32",
    medium: "w-36 sm:w-44",
    large: "w-44 sm:w-56",
  };

  const aspectClasses = {
    small: "aspect-[2/3]",
    medium: "aspect-[2/3]",
    large: "aspect-[2/3]",
  };

  return (
    <Link
      to={`/drama/${drama.bookId}`}
      className={`group relative flex-shrink-0 ${sizeClasses[size]}`}
    >
      <div
        className={`relative ${aspectClasses[size]} overflow-hidden rounded-lg bg-card`}
      >
        {/* Cover Image */}
        <img
          src={coverImage}
          alt={drama.bookName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          {drama.playCount && (
            <div className="mb-1 flex items-center gap-1 text-[10px] text-white/80">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span>{drama.playCount}</span>
            </div>
          )}
          {drama.chapterCount && (
            <div className="text-[10px] text-white/60">
              {drama.chapterCount} Episode
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2 line-clamp-2 text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
        {drama.bookName}
      </h3>

      {/* Tags */}
      {dramaTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {dramaTags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
