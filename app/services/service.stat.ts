import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  // const queries = new URLSearchParams(params);
  return fetcher(`/api/stats`);
};

export default {
  get,
};
