import { fetcher } from "@/lib/fetcher";

const get = (params?: Record<string, any>) => {
  const queries = new URLSearchParams(params);
  return fetcher(`/api/quotations?${queries}`);
};

// const post = (data: Record<string, any>) => {
//   return fetcher(`/api/quotations`, {
//     method: "POST",
//     body: JSON.stringify(data),
//   });
// };
const put = (id: number, data: Record<string, any>) => {
  return fetcher(`/api/quotations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

const generateInvoice = (id: number) => {
  return fetcher(`/api/quotations/invoice/${id}`, {
    method: "POST",
  });
}

export default {
  get,
  put,
  // post,
  generateInvoice
  //   updateStatus,
};
