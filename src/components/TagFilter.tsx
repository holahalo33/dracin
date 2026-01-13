import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onClearAll,
}: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayTags = isExpanded ? availableTags : availableTags.slice(0, 12);

  return (
    <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Filter by Tag</span>
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear All
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="gap-1 bg-primary text-primary-foreground"
            >
              {tag}
              <button
                onClick={() => onTagRemove(tag)}
                className="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Available Tags */}
      <div className="flex flex-wrap gap-2">
        {displayTags
          .filter((tag) => !selectedTags.includes(tag))
          .map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              {tag}
            </button>
          ))}
      </div>

      {/* Expand/Collapse */}
      {availableTags.length > 12 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 h-7 w-full text-xs text-muted-foreground"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              Show {availableTags.length - 12} More <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      )}

      {/* Link to All Tags */}
      <div className="mt-3 border-t border-border/50 pt-3">
        <Link
          to="/tags"
          className="text-xs text-primary hover:underline"
        >
          Browse all tags →
        </Link>
      </div>
    </div>
  );
}
