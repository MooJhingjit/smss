"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { FormSearchAsync } from "../form/form-search-async";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createQuotationList } from "@/actions/quotation-list/create";
import { User } from "@prisma/client";
import { FormInput } from "../form/form-input";
import { useQuotationListModal } from "@/hooks/use-quotation-list";

export const QuotationListModal = () => {
  const modal = useQuotationListModal();

  const handleCreate = useAction(createQuotationList, {
    onSuccess: (data) => {
      toast.success("New list created");
      modal.onClose();

    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const unitPrice = formData.get("unitPrice") as string;
    const cost = formData.get("cost") as string;
    const percentage = formData.get("percentage") as string;
    const quantity = formData.get("quantity") as string;
    const withholdingTax = formData.get("withholdingTax") as string;
    const withholdingTaxPercent = formData.get("withholdingTaxPercent") as string;


    const payload = {
      quotationId: 1,
      productId: 1,
      name,
      price: parseInt(price),
      unitPrice: parseInt(unitPrice),
      cost: parseInt(cost),
      percentage: parseInt(percentage),
      quantity: parseInt(quantity),
      withholdingTax: parseInt(withholdingTax),
      withholdingTaxPercent: parseInt(withholdingTaxPercent),
    };

    handleCreate.execute({ ...payload });

  };

  // const fieldErrors = (product?.id ? handleUpdate : handleCreate).fieldErrors;
  const fieldErrors = handleCreate.fieldErrors;

  
  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quotation List</DialogTitle>
          {/* <DialogDescription>Please select the customer.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-2 gap-3 mt-3">
          <div className="col-span-2">
            <FormSearchAsync
              id="customer"
              label="Product"
              config={{
                endpoint: "/users",
                params: {
                  role: "buyer",
                },
              }}
              onSelected={(item) => {
                // setCustomerDetails(item.data);
              }}
            // errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="name"
              label="Name"
              type="text"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="price"
              label="Price"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="unitPrice"
              label="Unit Price"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="cost"
              label="Cost"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="percentage"
              label="Percentage"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="quantity"
              label="Quantity"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="withholdingTax"
              label="Withholding Tax"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="withholdingTaxPercent"
              label="Withholding Tax Percent"
              type="number"
              // defaultValue={xxxxxx}
              errors={fieldErrors}
            />
          </div>

          <div className="col-start-2 col-span-1 flex justify-end">
            <FormSubmit>Create</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
