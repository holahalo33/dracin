const BASE_URL = "https://dramabox.sansekai.my.id/api/dramabox";

export interface Drama {
  bookId: string;
  bookName: string;
  coverWap: string;
  chapterCount?: number;
  introduction?: string;
  tags?: string[];
  tagV3s?: Array<{
    tagId: number;
    tagName: string;
    tagEnName: string;
  }>;
  corner?: {
    cornerType: number;
    name: string;
    color: string;
  };
  playCount?: string;
  inLibrary?: boolean;
}

export interface ColumnData {
  columnId: number;
  title: string;
  subTitle: string;
  style: string;
  bookList: Drama[];
}

export interface VipResponse {
  bannerList: any[];
  watchHistory: any[];
  columnVoList: ColumnData[];
}

export interface DramaDetail extends Drama {
  authorName?: string;
  status?: string;
  updateTime?: string;
  wordCount?: string;
  chapterList?: Array<{
    chapterId: string;
    chapterName: string;
    isLock: boolean;
  }>;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getForYou(): Promise<Drama[]> {
  const data = await fetchApi<any>("/foryou");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getTrending(): Promise<Drama[]> {
  const data = await fetchApi<any>("/trending");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getLatest(): Promise<Drama[]> {
  const data = await fetchApi<any>("/latest");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getVip(): Promise<VipResponse> {
  return fetchApi<VipResponse>("/vip");
}

export async function getRandom(): Promise<Drama[]> {
  const data = await fetchApi<any>("/randomdrama");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function searchDramas(query: string): Promise<Drama[]> {
  const data = await fetchApi<any>(`/search?query=${encodeURIComponent(query)}`);
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getDramaDetail(bookId: string): Promise<DramaDetail> {
  const data = await fetchApi<any>(`/detail?bookId=${encodeURIComponent(bookId)}`);
  return data?.data || data;
}

export async function getAllEpisodes(bookId: string): Promise<any[]> {
  const data = await fetchApi<any>(`/allepisode?bookId=${encodeURIComponent(bookId)}`);
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getDubIndo(): Promise<Drama[]> {
  const data = await fetchApi<any>("/dubindo");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getPopularSearch(): Promise<string[]> {
  const data = await fetchApi<any>("/populersearch");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}
