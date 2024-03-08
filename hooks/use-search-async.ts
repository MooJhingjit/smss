import { AsyncSelectConfigType } from "@/components/ui/custom.search-async";
import { debounce } from "@/lib/utils";
import { ReactElement, useCallback } from "react";

export const useSearchAsync = (
  config: AsyncSelectConfigType
  // endpoint: string,
  // defaultQuery: Record<string, string>,
) => {
  const mapData = useCallback((data: any[]) => {
    return data.map((item) => {
      return {
        value: item.id,
        label: item.name,
        data: item,
      };
    });
  }, []);

  const getSearchURL = (searchValue: string) => {
    const allParams = { ...config.params, search: searchValue };
    const params = new URLSearchParams(allParams);
    return `/api/${config.endpoint}?${params.toString()}`;
  };

  const search = useCallback(
    debounce(async (searchValue: string, callback: (options: any[]) => void) => {
      const response = await fetch(getSearchURL(searchValue), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (config.customRender) callback(data?.map(config.customRender));

      // default to mapData
      callback(mapData(data));

    }, 500), []);

  // const search = async (searchValue: string, callback: (options: any[]) => void) => {
  //   console.log("searchValue", searchValue)
  //   const response = await fetch(getSearchURL(searchValue), {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const data = await response.json();
  //   return mapData(data);

  // }


  return {
    search,
  };
};
