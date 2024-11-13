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

const deleteItem = (id: number) => {
  return fetcher(`/api/quotations/${id}`, {
    method: "DELETE",
  });
}


const APIs = {
  get,
  put,
  delete: deleteItem
};

export default APIs;