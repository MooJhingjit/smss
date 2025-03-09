import { fetcher } from "@/lib/fetcher";

const put = (id: number, data: Record<string, any>) => {
  return fetcher(`/api/quotation-lists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

const APIs = {
  put,
};

export default APIs;