import * as React from "react"
import AsyncSelect from 'react-select/async';
import { StylesConfig } from "react-select";
import { useSearchAsync } from "@/hooks/use-search-async";

// export interface InputProps
//   extends React.InputHTMLAttributes<HTMLInputElement> { }

// const promiseOptions = (inputValue: string, endpoint: string) =>
//   new Promise<any[]>((resolve) => {
//     setTimeout(() => {
//       resolve([
//         { value: 'chocolate', label: 'Chocolate' },
//         { value: 'strawberry', label: 'Strawberry' },
//         { value: 'vanilla', label: 'Vanilla' }
//       ]);
//     }, 1000);
//   });

const customStyles: StylesConfig = {
  control: (base: any) => ({
    ...base,
    // This line disable the blue border
    boxShadow: "none",
    borderRadius: "5px",
  }),

  option: (provided: any) => ({
    ...provided,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "12px",
    cursor: "pointer"
  }),
  input: (provided: any, state: any) => ({
    ...provided,
    fontSize: "12px"
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    fontSize: "12px"
  }),
  placeholder: (provided: any) => ({
    ...provided,
    fontSize: "12px"
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  })
};

const SearchAsync = React.forwardRef<any, any>(
  ({ className, id, defaultValue, ...props }, ref) => {

    const { search } = useSearchAsync(id)
    const onChange = (option: any) => {
      console.log("option", option)
    }
    return (
      <AsyncSelect
        loadOptions={search}
        cacheOptions
        id={id}
        name={id}
        // onChange={onChange}
        styles={customStyles}
        defaultValue={defaultValue}
        className="text-xs w-full h-[36px]"
        {...props}
      />
    )
  }
)
SearchAsync.displayName = "SearchAsync"

export { SearchAsync }
