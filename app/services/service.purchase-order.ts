import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  const queries = new URLSearchParams(params);
  return fetcher(`/api/purchase-orders?${queries}`);
};

const generatePOs = (data: Record<string, any>) => {
    return fetcher(`/api/purchase-orders/generate-all`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export default {
  get,
  generatePOs
//   updateStatus,
};
