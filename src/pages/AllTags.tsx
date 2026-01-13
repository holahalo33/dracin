import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/LoadingSpinner";
import { getTrending, Drama } from "@/services/dramaApi";
import { Tag, ArrowLeft, TrendingUp } from "lucide-react";

// Popular tags with colors
const popularTags = [
  { name: "Pria Dominan", color: "from-blue-500 to-indigo-600" },
  { name: "Supranatural", color: "from-purple-500 to-pink-600" },
  { name: "Pembalikan Identitas", color: "from-amber-500 to-orange-600" },
  { name: "Romantis", color: "from-rose-500 to-red-600" },
  { name: "Balas Dendam", color: "from-red-500 to-rose-700" },
  { name: "Perjalanan Waktu", color: "from-cyan-500 to-blue-600" },
  { name: "Sistem", color: "from-green-500 to-emerald-600" },
  { name: "Sejarah", color: "from-yellow-500 to-amber-600" },
  { name: "Kekuatan Khusus", color: "from-violet-500 to-purple-600" },
  { name: "Penyesalan", color: "from-slate-500 to-gray-600" },
  { name: "Penebusan", color: "from-teal-500 to-cyan-600" },
  { name: "Bangsawan", color: "from-amber-400 to-yellow-600" },
  { name: "Pemberontak", color: "from-orange-500 to-red-600" },
  { name: "Misteri", color: "from-indigo-500 to-blue-700" },
  { name: "Komedi", color: "from-pink-400 to-rose-500" },
  { name: "Drama", color: "from-gray-500 to-slate-700" },
];

export default function AllTags() {
  // Fetch trending to extract more tags
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: () => getTrending(1),
  });

  // Extract unique tags from trending dramas
  const extractedTags = new Set<string>();
  trendingData?.forEach((drama: Drama) => {
    const tags = drama.tags || drama.tagNames || [];
    tags.forEach((tag) => extractedTags.add(tag));
    drama.tagV3s?.forEach((tagV3) => extractedTags.add(tagV3.tagName));
  });

  // Combine with popular tags
  const allTags = Array.from(new Set([
    ...popularTags.map(t => t.name),
    ...Array.from(extractedTags)
  ]));

  const getTagColor = (tagName: string) => {
    const found = popularTags.find(t => t.name === tagName);
    return found?.color || "from-gray-500 to-slate-600";
  };

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
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Tag className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Semua Tag
          </h1>
          <p className="mt-2 text-muted-foreground">
            Jelajahi drama berdasarkan genre dan tag favorit kamu
          </p>
        </div>

        {/* Popular Tags Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Tag Populer</h2>
          </div>
          
          {isLoading ? (
            <PageLoader />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {allTags.map((tagName) => (
                <Link
                  key={tagName}
                  to={`/tag/${encodeURIComponent(tagName)}`}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getTagColor(tagName)} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                  />
                  
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg bg-gradient-to-br ${getTagColor(tagName)} p-1.5`}>
                      <Tag className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {tagName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
