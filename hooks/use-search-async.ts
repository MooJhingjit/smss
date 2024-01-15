import { useState } from "react";

export const useSearchAsync = (endpoint: string) => {

  const [data, setData] = useState<any[]>([]);


  const search = async (searchValue: string) => {

    // const response = await fetch(`${endpoint}?search=${searchValue}`);
    // const data = await response.json();
    // setData(data);

    const res = await new Promise<any[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { value: 'chocolate', label: 'Chocolate' },
          { value: 'strawberry', label: 'Strawberry' },
          { value: 'vanilla', label: 'Vanilla' }
        ]);
      }, 1000);
    })

    return res;
  }
  

  return {
    search
  };
}