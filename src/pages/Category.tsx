import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { DramaCard } from "@/components/DramaCard";
import { PageLoader } from "@/components/LoadingSpinner";
import { getTrending, getLatest, getVip, getForYou, getRandom, getDubIndo } from "@/services/dramaApi";
import { ArrowLeft, Crown, Flame, Sparkles, Clock, Shuffle, Globe } from "lucide-react";

const categoryConfig: Record<string, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fetcher: () => Promise<any>;
}> = {
  trending: {
    title: "Trending",
    subtitle: "Drama paling populer saat ini",
    icon: <Flame className="h-6 w-6 text-orange-500" />,
    fetcher: getTrending,
  },
  latest: {
    title: "Terbaru",
    subtitle: "Drama yang baru ditambahkan",
    icon: <Clock className="h-6 w-6 text-blue-500" />,
    fetcher: getLatest,
  },
  vip: {
    title: "VIP Eksklusif",
    subtitle: "Konten premium untuk member VIP",
    icon: <Crown className="h-6 w-6 text-amber-500" />,
    fetcher: async () => {
      const data = await getVip();
      return data?.columnVoList?.flatMap((col) => col.bookList) || [];
    },
  },
  foryou: {
    title: "Untukmu",
    subtitle: "Rekomendasi berdasarkan selera kamu",
    icon: <Sparkles className="h-6 w-6 text-pink-500" />,
    fetcher: getForYou,
  },
  random: {
    title: "Random",
    subtitle: "Drama pilihan acak untuk kamu",
    icon: <Shuffle className="h-6 w-6 text-green-500" />,
    fetcher: getRandom,
  },
  dubindo: {
    title: "Dubbing Indonesia",
    subtitle: "Drama dengan dubbing Bahasa Indonesia",
    icon: <Globe className="h-6 w-6 text-red-500" />,
    fetcher: getDubIndo,
  },
};

export default function Category() {
  const { type } = useParams<{ type: string }>();
  const config = categoryConfig[type || "trending"];

  const { data: dramas, isLoading } = useQuery({
    queryKey: ["category", type],
    queryFn: config?.fetcher || getTrending,
    enabled: !!config,
  });

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 pt-16">
          <p className="text-lg text-muted-foreground">Kategori tidak ditemukan</p>
          <Link to="/" className="text-primary hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          {config.icon}
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {config.title}
            </h1>
            <p className="text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <PageLoader />
        ) : dramas && dramas.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 pb-12 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
            {dramas.map((drama: any) => (
              <DramaCard key={drama.bookId} drama={drama} size="medium" />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada drama di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
