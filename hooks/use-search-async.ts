import { useCallback } from "react";

export const useSearchAsync = (endpoint: string, defaultQuery: Record<string, string>) => {

  const mapData = useCallback((data: any[]) => {
    return data.map((item) => {
      return {
        value: item.id,
        label: item.name,
        data: item
      }
    })
  }, []);


  const getSearchURL = (searchValue: string) => {
    const allParams = { ...defaultQuery, search: searchValue }
    const params = new URLSearchParams(allParams);
    return `/api/${endpoint}?${params.toString()}`
  };

  const search = async (searchValue: string) => {
    const response = await fetch(
      getSearchURL(searchValue),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return mapData(data);
  }
  return {
    search
  };
}

