import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  return fetcher(`/api/stats`);
};

const getDetails = (params: { year: number; month: number; sellerId?: number }) => {
  const queries = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
    ...(params.sellerId ? { sellerId: String(params.sellerId) } : {}),
  });
  return fetcher(`/api/stats/details?${queries.toString()}`);
};

const APIs = {
  get,
  getDetails,
};

export default APIs;