import * as React from "react"
import AsyncSelect from 'react-select/async';
import { StylesConfig } from "react-select";
import { useSearchAsync } from "@/hooks/use-search-async";

export type Config = {
  endpoint: string;
  params: Record<string, any>;
}

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
  ({ className, id, defaultValue, onSelected, config, ...props }, ref) => {

    const { search } = useSearchAsync(config.endpoint, config.params)
    return (
      <AsyncSelect
        loadOptions={search}
        cacheOptions
        id={id}
        name={id}
        onChange={onSelected}
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
