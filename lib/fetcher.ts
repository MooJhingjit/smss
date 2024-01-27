export const fetcher = (url: string, options?: Record<string, any>) =>
  fetch(url, options).then((res) => res.json());
