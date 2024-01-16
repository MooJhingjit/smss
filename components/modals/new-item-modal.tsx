"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useItemModal } from "@/hooks/use-item-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const NewItemModal = () => {
  const modal = useItemModal();

  // const { execute, isLoading } = useAction(createQuotation, {
  //   onSuccess: (data) => {
  //     window.location.href = data;
  //   },
  //   onError: (error) => {
  //     toast.error(error);
  //   }
  // });

  // const onClick = () => {
  //   execute({});
  // };

  const execute = () => {
    window.location.href = "/quotations/1";
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Items</DialogTitle>
          <DialogDescription>
            <div className="flex space-x-3">
              <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-blue-700/10">
                PO-0001
              </span>
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-blue-700/10">
                Wireless Mouse
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <ItemLists />
        <DialogFooter>
          <Button type="button" onClick={execute}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ItemLists = () => {
  return (
    <table className="w-full text-gray-500 ">
      <thead className="text-left text-sm text-gray-500 ">
        <tr>
          <th>
            
          </th>
          <th scope="col" className="text-xs font-normal">
            Serial Number
          </th>
          <th scope="col" className="py-3 pr-8 text-xs  font-normal">
            Warranty
          </th>
          <th scope="col" className="py-3 pr-8 text-xs  font-normal">
            Cost
          </th>

          {/* <th scope="col" className=" w-1/12 py-3 pr-8 text-xs font-normal">
            Note
          </th> */}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
        {Array.from({ length: 2 }).map((_, index) => (
          <tr className="border-b border-gray-200 ">
            <td>{index + 1}</td>
            <td>
              <Input id="serial-number" className="my-2" />
            </td>
            <td>
              <Input type="date" id="warranty" />
            </td>
            <td>฿1,000</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
