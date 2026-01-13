const BASE_URL = "https://dramabox.sansekai.my.id/api/dramabox";

export interface Drama {
  bookId: string;
  bookName: string;
  coverWap?: string;
  cover?: string; // Search API uses 'cover' instead of 'coverWap'
  bookCover?: string; // Random API uses 'bookCover'
  chapterCount?: number;
  introduction?: string;
  tags?: string[];
  tagNames?: string[]; // Search API uses 'tagNames' instead of 'tags'
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
  rankVo?: {
    rankType: number;
    hotCode: string;
    sort: number;
  };
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

export async function getForYou(page: number = 1): Promise<Drama[]> {
  const data = await fetchApi<any>(`/foryou?page=${page}`);
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getTrending(page: number = 1): Promise<Drama[]> {
  const data = await fetchApi<any>(`/trending?page=${page}`);
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getLatest(page: number = 1): Promise<Drama[]> {
  const data = await fetchApi<any>(`/latest?page=${page}`);
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getVip(): Promise<VipResponse> {
  return fetchApi<VipResponse>("/vip");
}

export async function getRandom(page: number = 1): Promise<Drama[]> {
  const data = await fetchApi<any>(`/randomdrama?page=${page}`);
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

export async function getDubIndo(page: number = 1): Promise<Drama[]> {
  const data = await fetchApi<any>(`/dubindo?page=${page}`);
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}

export async function getPopularSearch(): Promise<string[]> {
  const data = await fetchApi<any>("/populersearch");
  return Array.isArray(data) ? data : data?.data || data?.result || [];
}
