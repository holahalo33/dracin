import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { TrendingUp, Clock, Shuffle, Mic, Sparkles, Grid3X3 } from "lucide-react";

const categories = [
  {
    id: "trending",
    title: "Trending",
    description: "Drama yang sedang populer saat ini",
    icon: TrendingUp,
    color: "from-rose-500 to-orange-500",
  },
  {
    id: "latest",
    title: "Terbaru",
    description: "Drama yang baru dirilis",
    icon: Clock,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "foryou",
    title: "Untuk Kamu",
    description: "Rekomendasi drama pilihan",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "dubindo",
    title: "Dubbing Indo",
    description: "Drama dengan dubbing Indonesia",
    icon: Mic,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "random",
    title: "Acak",
    description: "Temukan drama secara acak",
    icon: Shuffle,
    color: "from-amber-500 to-yellow-500",
  },
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Grid3X3 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Kategori Drama
          </h1>
          <p className="mt-2 text-muted-foreground">
            Jelajahi berbagai kategori drama favorit kamu
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />
                
                {/* Icon */}
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${category.color} p-3`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                  {category.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.description}
                </p>
                
                {/* Arrow */}
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Lihat Semua
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
