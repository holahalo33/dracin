import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { DramaRow } from "@/components/DramaRow";
import { PageLoader } from "@/components/LoadingSpinner";
import { getForYou, getTrending, getLatest, getVip, getDubIndo } from "@/services/dramaApi";

export default function Home() {
  const { data: forYouData, isLoading: forYouLoading } = useQuery({
    queryKey: ["forYou"],
    queryFn: getForYou,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ["latest"],
    queryFn: getLatest,
  });

  const { data: vipData, isLoading: vipLoading } = useQuery({
    queryKey: ["vip"],
    queryFn: getVip,
  });

  const { data: dubIndoData } = useQuery({
    queryKey: ["dubindo"],
    queryFn: getDubIndo,
  });

  const isLoading = forYouLoading && trendingLoading && latestLoading;

  // Get featured drama for hero
  const featuredDrama = trendingData?.[0] || forYouData?.[0] || null;

  // Get VIP dramas from columns
  const vipDramas = vipData?.columnVoList?.[0]?.bookList || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <HeroBanner drama={featuredDrama} />

      {/* Content Rows */}
      <div className="-mt-20 relative z-10 space-y-2 pb-12">
        {trendingData && trendingData.length > 0 && (
          <DramaRow
            title="🔥 Trending Sekarang"
            subtitle="Drama paling populer minggu ini"
            dramas={trendingData}
            size="large"
          />
        )}

        {forYouData && forYouData.length > 0 && (
          <DramaRow
            title="✨ Untukmu"
            subtitle="Rekomendasi berdasarkan selera kamu"
            dramas={forYouData}
          />
        )}

        {vipDramas.length > 0 && (
          <DramaRow
            title="👑 VIP Eksklusif"
            subtitle="Konten premium untuk member VIP"
            dramas={vipDramas}
          />
        )}

        {latestData && latestData.length > 0 && (
          <DramaRow
            title="🆕 Baru Ditambahkan"
            subtitle="Drama terbaru yang bisa kamu tonton"
            dramas={latestData}
          />
        )}

        {dubIndoData && dubIndoData.length > 0 && (
          <DramaRow
            title="🇮🇩 Dubbing Indonesia"
            subtitle="Drama dengan dubbing Bahasa Indonesia"
            dramas={dubIndoData}
          />
        )}

        {/* Second VIP Column if available */}
        {vipData?.columnVoList?.[1]?.bookList && (
          <DramaRow
            title={vipData.columnVoList[1].title || "Pilihan Spesial"}
            dramas={vipData.columnVoList[1].bookList}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 DramaBox Clone. Dibuat dengan ❤️</p>
            <p className="mt-1 text-xs">
              Data dari DramaBox API. Untuk tujuan edukasi saja.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
