import { Drama } from "@/services/dramaApi";
import { Play, Star, Flame, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface DramaCardWithRankProps {
  drama: Drama;
  rank?: number;
  showRank?: boolean;
  size?: "small" | "medium" | "large";
}

export function DramaCardWithRank({ 
  drama, 
  rank, 
  showRank = false,
  size = "medium" 
}: DramaCardWithRankProps) {
  const coverImage = drama.coverWap || drama.cover || drama.bookCover || "";
  const dramaTags = drama.tags || drama.tagNames || [];

  const sizeClasses = {
    small: "w-28 sm:w-32",
    medium: "w-36 sm:w-44",
    large: "w-44 sm:w-56",
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-600 text-yellow-900";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-700 text-orange-900";
    return "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground";
  };

  return (
    <Link
      to={`/drama/${drama.bookId}`}
      className={`group relative flex-shrink-0 ${sizeClasses[size]}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-card">
        {/* Cover Image */}
        <img
          src={coverImage}
          alt={drama.bookName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Rank Badge */}
        {showRank && rank && (
          <div className={`absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-lg ${getRankStyle(rank)}`}>
            {rank}
          </div>
        )}

        {/* Hot Badge from API */}
        {drama.rankVo && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg">
            <Flame className="h-3 w-3" />
            {drama.rankVo.hotCode}
          </div>
        )}

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center gap-2">
            {drama.playCount && (
              <div className="flex items-center gap-1 text-[10px] text-white/80">
                <Eye className="h-3 w-3" />
                <span>{drama.playCount}</span>
              </div>
            )}
            {drama.chapterCount && (
              <div className="text-[10px] text-white/60">
                {drama.chapterCount} Ep
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2 line-clamp-2 text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
        {drama.bookName}
      </h3>

      {/* Tags - Clickable */}
      {dramaTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {dramaTags.slice(0, 2).map((tag, index) => (
            <Link
              key={index}
              to={`/tag/${encodeURIComponent(tag)}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </Link>
  );
}
