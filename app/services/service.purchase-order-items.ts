import { fetcher } from "@/lib/fetcher";

const put = (id: number, data: Record<string, any>) => {
  return fetcher(`/api/purchase-order-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export default {
  put,
};
