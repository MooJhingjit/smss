import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  const queries = new URLSearchParams(params);
  return fetcher(`/api/media?${queries}`);
};

const post = (data: Record<string, any>) => {
  return fetcher(`/api/media`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const deleteMedia = (id: number) => {
  return fetcher(`/api/media/${id}`, {
    method: "DELETE",
  });
};

const APIs = {
  get,
  post,
  deleteMedia
};

export default APIs;