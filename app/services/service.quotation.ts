import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  const queries = new URLSearchParams(params);
  return fetcher(`/api/quotations?${queries}`);
};

const put = (id: number, data: Record<string, any>) => {
  return fetcher(`/api/quotations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export default {
  get,
  put,
  //   updateStatus,
};
