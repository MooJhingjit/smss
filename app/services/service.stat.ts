import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  // const queries = new URLSearchParams(params);
  return fetcher(`/api/stats`);
};

const APIs = {
  get,
};

export default APIs;