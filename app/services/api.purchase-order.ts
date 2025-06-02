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

const put = (id: number, data: Record<string, any>) => {
  return fetcher(`/api/purchase-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

const deleteItem = (id: number) => {
  return fetcher(`/api/purchase-orders/${id}`, {
    method: "DELETE",
  });
};

const APIs = {
  get,
  generatePOs,
  put,
  delete: deleteItem,
};

export default APIs;