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
import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { useForm } from "react-hook-form";
import { FormTextarea } from "../form/form-textarea";

type FormInput = {
  productId: string;
  name: string;
  price: string;
  unitPrice: string;
  cost: string;
  percentage: string;
  quantity: string;
  withholdingTax: string;
  withholdingTaxPercent: string;
};

export const QuotationListModal = () => {
  const [productSelected, setProduct] = useState<Product | null>(null);
  const modal = useQuotationListModal();
  const defaultData = modal.data;
  const p = defaultData?.percentage?.toString() ?? ""
  const refs = modal.refs;
  const {
    register,
    watch,
    reset,
    getValues,
    setValue,
    // formState: { dirtyFields }
  } = useForm<FormInput>({
    mode: "onChange",
  });

  useEffect(() => {
    if (!defaultData) return;
    const formData = {
      name: defaultData?.name ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      unitPrice: defaultData?.unitPrice
        ? defaultData.unitPrice.toString()
        : "",
      cost: defaultData?.cost ? defaultData.cost.toString() : "",
      percentage: p,
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "",
      withholdingTax: defaultData?.withholdingTax
        ? defaultData.withholdingTax.toString()
        : "",
      withholdingTaxPercent: defaultData?.withholdingTaxPercent
        ? defaultData.withholdingTaxPercent.toString()
        : "",
    }
    reset(
      formData,
    )
  }, [defaultData, reset])

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
    const price = formData.get("price") as string;
    const cost = formData.get("cost") as string;
    const percentage = formData.get("percentage") as string;
    const quantity = formData.get("quantity") as string;
    const withholdingTax = formData.get("withholdingTax") as string;
    const withholdingTaxPercent = formData.get(
      "withholdingTaxPercent",
    ) as string;

    const product = productId
      ? parseInt(productId)
      : refs?.productRef?.id ?? null;

    if (!refs?.quotationRef?.id || !product) {
      toast.error("Quotation not found");
      return;
    }

    const payload = {
      quotationId: refs.quotationRef.id,
      productId: product,
      name: "",
      price: parseFloat(price),
      unitPrice: parseFloat(price),
      cost: parseFloat(cost),
      percentage: parseFloat(percentage),
      quantity: parseFloat(quantity),
      withholdingTax: parseFloat(withholdingTax),
      withholdingTaxPercent: parseFloat(withholdingTaxPercent),
    };


    if (defaultData?.id) {
      handleUpdate.execute({
        id: defaultData.id,
        ...payload,
      });
      return;
    }

    handleCreate.execute({ ...payload });
  };

  const fieldErrors = (defaultData?.id ? handleUpdate : handleCreate).fieldErrors;

  useEffect(() => {

    const cost = watch('cost');
    const percentage = watch('percentage');
    if (cost && percentage) {
      const newPrice = parseFloat(cost) + (parseFloat(cost) * parseFloat(percentage)) / 100
      setValue('price', newPrice.toString())
    }
  }, [watch('cost'), watch('percentage')]);

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
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
                id: defaultData?.product.id,
                label: defaultData?.product.name,
              }}
              onSelected={(item) => {
                setProduct(item.data);
                setValue("percentage", item.data.percentage);
                setValue("cost", item.data.cost);

              }}
              errors={fieldErrors}
            />
          </div>

          <div className="hidden">
            <FormInput
              id="name"
              label="Name"
              type="text"
              defaultValue={defaultData?.name}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="cost"
              label="Cost"
              register={register}
              type="number"
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="percentage"
              label="Percentage"
              type="number"
              register={register}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="price"
              label="Price"
              type="number"
              readOnly
              register={register}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="quantity"
              label="Quantity"
              type="number"
              defaultValue={defaultData?.quantity}
              errors={fieldErrors}
            />
          </div>

          <div className="col-span-2">
            <FormInput
              id="withholdingTax"
              label="Withholding Tax"
              type="number"
              readOnly
              defaultValue={defaultData?.withholdingTax}
              errors={fieldErrors}
            />
          </div>

          <div className="col-span-2">
            <FormInput
              id="withholdingTaxPercent"
              label="Withholding Tax Percent"
              type="number"
              readOnly
              defaultValue={defaultData?.withholdingTaxPercent}
              errors={fieldErrors}
            />
          </div>

          <div className="col-span-4">
            <FormTextarea
              id="description"
              label="Description"
              errors={fieldErrors}
              rows={6}
            />
          </div>

          <div className="col-start-4 col-span-1 flex justify-end">
            <FormSubmit>
              {defaultData?.id ? "Update" : "Create"}
            </FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
