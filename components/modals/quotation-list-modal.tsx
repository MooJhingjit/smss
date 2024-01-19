"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSearchAsync } from "../form/form-search-async";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createQuotationList } from "@/actions/quotation-list/create";
import { updateQuotationList } from "@/actions/quotation-list/update";
import { FormInput } from "../form/form-input";
import { useQuotationListModal } from "@/hooks/use-quotation-list";
import { use, useEffect, useMemo, useState } from "react";
import { Product } from "@prisma/client";

export const QuotationListModal = () => {
  const [defaultProduct, setDefaultProduct] = useState<Product | null>(null);
  const modal = useQuotationListModal();
  const data = modal.data
  const refs = modal.refs

  // useEffect(() => {
  //   console.log(defaultProduct)
  //   // set default value for cost and percentage
  //   if (refs?.productRef) {
  //     // setDefaultProduct
  //   }
  // }, [refs]);

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

  const handleUpdate = useAction(updateQuotationList, {
    onSuccess: (data) => {
      toast.success("List updated");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {



    const productId = formData.get("productId") as string;
    // const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    // const unitPrice = formData.get("unitPrice") as string;
    const cost = formData.get("cost") as string;
    const percentage = formData.get("percentage") as string;
    const quantity = formData.get("quantity") as string;
    const withholdingTax = formData.get("withholdingTax") as string;
    const withholdingTaxPercent = formData.get("withholdingTaxPercent") as string;

    const product = productId ? parseInt(productId) : refs?.productRef?.id ?? null

    if (!refs?.quotationRef?.id || !product) {
      toast.error("Quotation not found");
      return;
    }

    const payload = {
      quotationId: refs.quotationRef.id,
      productId: product,
      name: "",
      price: parseInt(price),
      unitPrice: parseInt(price),
      cost: parseInt(cost),
      percentage: parseInt(percentage),
      quantity: parseInt(quantity),
      withholdingTax: parseInt(withholdingTax),
      withholdingTaxPercent: parseInt(withholdingTaxPercent),
    };

    if (data?.id) {
      handleUpdate.execute({
        id: data.id,
        ...payload
      });
      return;
    }

    handleCreate.execute({ ...payload });

  };

  const fieldErrors = (data?.id ? handleUpdate : handleCreate).fieldErrors;
  const defaultPrice = useMemo(() => {
    if (data?.price) return data?.price

    if (defaultProduct?.cost && defaultProduct?.percentage) {
      return defaultProduct.cost + (defaultProduct.cost * parseFloat(defaultProduct.percentage.toString()) / 100);
    }

    return ""
  }, [defaultProduct, data?.price]);

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quotation List</DialogTitle>
          {/* <DialogDescription>Please select the customer.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-4 gap-3 mt-3">
          <div className="col-span-4">
            <FormSearchAsync
              id="productId"
              label="Product"
              config={{
                endpoint: "products",
                params: {},
              }}
              defaultValue={{
                id: data?.product.id,
                label: data?.product.name,
              }}
              onSelected={(item) => {
                setDefaultProduct(item.data);
              }}
              errors={fieldErrors}
            />
          </div>

          <div className="hidden">
            <FormInput
              id="name"
              label="Name"
              type="text"
              defaultValue={data?.name}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="cost"
              label="Cost"
              type="number"
              defaultValue={data?.cost ?? defaultProduct?.cost ?? ""}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="percentage"
              label="Percentage"
              type="number"
              defaultValue={data?.percentage ?? defaultProduct?.percentage ?? ""}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="price"
              label="Price"
              type="number"
              defaultValue={defaultPrice}
              errors={fieldErrors}
            />
          </div>
          {/* 
          <div className="">
            <FormInput
              id="unitPrice"
              label="Unit Price"
              type="number"
              defaultValue={data?.unitPrice}
              errors={fieldErrors}
            />
          </div> */}
          <div className="">
            <FormInput
              id="quantity"
              label="Quantity"
              type="number"
              defaultValue={data?.quantity}
              errors={fieldErrors}
            />
          </div>

          <div className="col-span-2">
            <FormInput
              id="withholdingTax"
              label="Withholding Tax"
              type="number"
              defaultValue={data?.withholdingTax}
              errors={fieldErrors}
            />
          </div>

          <div className="col-span-2">
            <FormInput
              id="withholdingTaxPercent"
              label="Withholding Tax Percent"
              type="number"
              defaultValue={data?.withholdingTaxPercent}
              errors={fieldErrors}
            />
          </div>

          <div className="col-start-4 col-span-1 flex justify-end">
            <FormSubmit>Create</FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
