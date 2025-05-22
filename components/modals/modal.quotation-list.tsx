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
import { useProductModal } from "@/hooks/use-product-modal";
import { useEffect, useState } from "react";
import { ProductType, QuotationType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { FormTextarea } from "../form/form-textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  LockIcon,
  MinusCircle,
  PlusCircle,
  PlusIcon,
} from "lucide-react";
import { productTypeMapping, quotationTypeMapping } from "@/app/config";
import { classNames } from "@/lib/utils";
import { ProductWithRelations } from "@/types";
import { Button } from "../ui/button";
import ConfirmActionButton from "../confirm-action";
import { deleteQuotationList } from "@/actions/quotation-list/delete";
import { Badge } from "../ui/badge";
import { NewProductModal } from "./modal.product";

type FormInput = {
  productId: string;
  productType: string;
  name: string;
  price: string;
  unitPrice: string;
  cost: string;
  unit: string;
  percentage: string;
  quantity: string;
  withholdingTax: string;
  withholdingTaxPercent: string;
  totalPrice: string;
  discount: string;
  description: string;
  groupName: string;
  subItems: string;
};

export const QuotationListModal = () => {
  const modal = useQuotationListModal();
  const productModal = useProductModal();
  const defaultData = modal.data;
  const p = defaultData?.percentage?.toString() ?? "";
  const refs = modal.refs;
  const isProduct = refs?.quotationRef?.type === QuotationType.product;
  const { register, watch, reset, getValues, setValue } = useForm<FormInput>({
    mode: "onChange",
  });
  // Add state to track if the modal should be visually hidden
  const [isHidden, setIsHidden] = useState(false);

  const handleOpenProductModal = () => {
    // Hide the quotation list modal visually instead of closing it
    setIsHidden(true);

    // Open the product modal and provide callbacks for creation and closing
    productModal.onOpen(
      undefined,
      // Callback for when a product is created
      (newProduct) => {
        // Show the quotation list modal again
        setIsHidden(false);

        // If we have a new product, update the form with its data
        if (newProduct) {
          setValue("name", newProduct.name);
          setValue("percentage", newProduct.percentage?.toString() ?? "");
          setValue("cost", newProduct.cost?.toString() ?? "");
          setValue("description", newProduct.description || "");
          setValue("unit", newProduct.unit || "");

          // Set the product ID in the form
          if (newProduct.id) {
            setValue("productId", newProduct.id.toString());
          }
        }
      },
      // Callback for when modal is closed (without creating a product)
      () => {
        // Show the quotation list modal again
        setIsHidden(false);
      }
    );
  };

  // console.log("getValues", getValues());

  // normally user cannot edit the quotation list after PO is created (isLocked will be true)
  const isLocked = refs?.quotationRef?.isLocked;

  useEffect(() => {
    const formData = {
      name: defaultData?.name ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "0",
      unitPrice: defaultData?.unitPrice
        ? defaultData.unitPrice.toString()
        : "0",
      cost: defaultData?.cost ? defaultData.cost.toString() : "0",
      unit: defaultData?.unit ?? "",
      productId: defaultData?.product.id
        ? defaultData.product.id.toString()
        : "",
      productType: defaultData?.product.type ?? "",
      percentage: p,
      groupName: defaultData?.groupName ?? "",
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "1",
      withholdingTax: defaultData?.withholdingTax
        ? defaultData.withholdingTax.toString()
        : "0",
      withholdingTaxPercent: defaultData?.withholdingTaxPercent
        ? defaultData.withholdingTaxPercent.toString()
        : "7",
      totalPrice: defaultData?.totalPrice
        ? defaultData.totalPrice.toString()
        : "0",
      discount: defaultData?.discount ? defaultData.discount.toString() : "0",
      description: defaultData?.description ?? "",
      subItems: defaultData?.subItems ? defaultData.subItems : "[]",
    };
    reset(formData);
  }, [refs?.timestamps]);

  const handleCreate = useAction(createQuotationList, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateQuotationList, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleDelete = useAction(deleteQuotationList, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    const productId = formData.get("productId") as string;
    const productType = formData.get("productType") as ProductType;
    const name = formData.get("name") as string;
    // const price = formData.get("price") as string;
    const unitPrice = formData.get("unitPrice") as string;
    const cost = formData.get("cost") as string;
    const unit = formData.get("unit") as string;
    const percentage = formData.get("percentage") as string;
    const quantity = formData.get("quantity") as string;
    const withholdingTax = formData.get("withholdingTax") as string;
    const withholdingTaxPercent = formData.get(
      "withholdingTaxPercent"
    ) as string;
    const groupName = formData.get("groupName") as string;

    const product = productId
      ? parseInt(productId)
      : refs?.productRef?.id ?? null;

    const total = formData.get("totalPrice") as string;
    const discount = formData.get("discount") as string;
    const description = formData.get("description") as string;
    console.log("Form Data Submitted: quotationRef id", refs?.quotationRef?.id);
    console.log("Form Data Submitted: product id", product);
    if (!refs?.quotationRef?.id || !product) {
      toast.error("จำเป็นต้องกรอกข้อมูลให้ครบ");
      return;
    }

    const payload = {
      quotationId: refs.quotationRef.id,
      productId: product,
      productType,
      name,
      price: parseFloat(unitPrice) * parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      unit,
      cost: parseFloat(cost),
      percentage: percentage ? parseFloat(percentage) : 0,
      quantity: parseFloat(quantity),
      withholdingTax: parseFloat(withholdingTax),
      withholdingTaxPercent: parseFloat(withholdingTaxPercent),
      totalPrice: parseFloat(total),
      discount: discount ? parseFloat(discount) : 0,
      description,
      groupName,
      subItems: getValues("subItems"),
      quotationType: refs.quotationRef.type,
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

  const fieldErrors = (defaultData?.id ? handleUpdate : handleCreate)
    .fieldErrors;

  const summarizeResults = (
    caseUpdate: "discount" | "quantity" | "interestRate" | "unitPrice" | "cost",
    {
      cost,
      unitPrice,
      interestRate,
      quantity,
      discount,
    }: {
      cost: string;
      unitPrice: string;
      interestRate: string;
      quantity: string;
      discount: string;
    }
  ) => {
    const costValue = parseFloat(cost) || 0;
    const unitPriceValue = parseFloat(unitPrice) || 0;
    const interestRateValue = parseFloat(interestRate) || 0;
    const quantityValue = parseFloat(quantity) || 0;
    const discountValue = parseFloat(discount) || 0;

    // calculate all data, do not use setValue 

    // case: interestRate => calculate unitPrice, tax, totalPrice
    if (caseUpdate === "interestRate") {
      const unitPrice = costValue + (costValue * interestRateValue) / 100;
      const totalPrice = unitPrice * quantityValue;
      const tax = (totalPrice * 7) / 100;
      return {
        unitPrice: unitPrice,
        tax: tax,
        totalPrice: (totalPrice + tax - discountValue),
        
      };
    }

    // case: unitPrice => calculate interestRate, tax, totalPrice
    if (caseUpdate === "unitPrice") {
      const interestRate = unitPriceValue > 0
        ? (((unitPriceValue - costValue) / costValue) * 100)
        : "";
      const totalPrice = unitPriceValue * quantityValue;
      const tax = (totalPrice * 7) / 100;
      return {
        interestRate,
        tax: tax,
        totalPrice: (totalPrice + tax - discountValue),
      };
    }

    // case: cost => calculate  unitPrice, tax, totalPrice
    if (caseUpdate === "cost") {
      const unitPrice = costValue + (costValue * interestRateValue) / 100;
      const totalPrice = unitPrice * quantityValue;
      const tax = (totalPrice * 7) / 100;
      return {
        unitPrice: unitPrice,
        tax: tax,
        totalPrice: (totalPrice + tax - discountValue),
      };
    }

    // case: quantity => calculate tax, totalPrice
    if (caseUpdate === "quantity") {
      const totalPrice = unitPriceValue * quantityValue;
      const tax = (totalPrice * 7) / 100;
      return {
        tax: tax,
        totalPrice: (totalPrice + tax - discountValue),
      };
    }

    // case: discount => calculate tax, totalPrice
    if (caseUpdate === "discount") {
      const totalPrice = unitPriceValue * quantityValue;
      const tax = (totalPrice * 7) / 100;
      return {
        tax: tax,
        totalPrice: (totalPrice + tax - discountValue),
      };
    }
    

  };

  // interestRate update
  useEffect(() => {
    const results = summarizeResults("interestRate", {
      cost: getValues("cost") ?? "0",
      unitPrice: getValues("unitPrice") || "0",
      interestRate: getValues("percentage") || "0",
      quantity: getValues("quantity") ?? "1",
      discount: getValues("discount") ?? "0",
    });
    
    if (results?.unitPrice) setValue("unitPrice", results.unitPrice.toString());
    if (results?.tax) setValue("withholdingTax", results.tax.toString());
    if (results?.totalPrice) setValue("totalPrice", results.totalPrice.toString());

  }, [watch("percentage")]);

  // unitPrice update
  useEffect(() => {
    const results = summarizeResults("unitPrice", {
      cost: getValues("cost") ?? "0",
      unitPrice: getValues("unitPrice") || "0",
      interestRate: getValues("percentage") || "0",
      quantity: getValues("quantity") ?? "1",
      discount: getValues("discount") ?? "0",
    });
    if (results?.interestRate) setValue("percentage", results.interestRate.toString());
    if (results?.tax) setValue("withholdingTax", results.tax.toString());
    if (results?.totalPrice) setValue("totalPrice", results.totalPrice.toString());

  }, [watch("unitPrice")]);

  // cost update
  useEffect(() => {
    const results = summarizeResults("cost", {
      cost: getValues("cost") ?? "0",
      unitPrice: getValues("unitPrice") || "0",
      interestRate: getValues("percentage") || "0",
      quantity: getValues("quantity") ?? "1",
      discount: getValues("discount") ?? "0",
    });
    if (results?.unitPrice) setValue("unitPrice", results.unitPrice.toString());
    if (results?.tax) setValue("withholdingTax", results.tax.toString());
    if (results?.totalPrice) setValue("totalPrice", results.totalPrice.toString());

  }, [watch("cost")]);

  // quantity update
  useEffect(() => {
    const results = summarizeResults("quantity", {
      cost: getValues("cost") ?? "0",
      unitPrice: getValues("unitPrice") || "0",
      interestRate: getValues("percentage") || "0",
      quantity: getValues("quantity") ?? "1",
      discount: getValues("discount") ?? "0",
    });
    if (results?.tax) setValue("withholdingTax", results.tax.toString());
    if (results?.totalPrice) setValue("totalPrice", results.totalPrice.toString());

  }, [watch("quantity")]);

  // discount update
  useEffect(() => {
    const results = summarizeResults("discount", {
      cost: getValues("cost") ?? "0",
      unitPrice: getValues("unitPrice") || "0",
      interestRate: getValues("percentage") || "0",
      quantity: getValues("quantity") ?? "1",
      discount: getValues("discount") ?? "0",
    });
    if (results?.tax) setValue("withholdingTax", results.tax.toString());
    if (results?.totalPrice) setValue("totalPrice", results.totalPrice.toString());

  }, [watch("discount")]);

  // useEffect(() => {
  //   const cost = watch("cost");
  //   const unitPrice = parseFloat(watch("unitPrice") || "0");
 
  //   // multiply by quantity
  //   const quantity = watch("quantity");
  //   let totalPrice = unitPrice;
  //   if (quantity) {
  //     totalPrice = unitPrice * parseFloat(quantity);
  //   }
  //   // calculate tax 7%
  //   const tax = (totalPrice * 7) / 100;
  //   setValue("withholdingTax", tax ? tax.toString() : "0");

  //   // set total price + tax - discount
  //   const discount = watch("discount");
  //   let total = totalPrice + tax;
  //   if (discount) {
  //     total = total - parseFloat(discount);
  //   }

  //   setValue("totalPrice", total ? total.toString() : "0");
  // }, [
  //   watch("cost"),
  //   watch("percentage"),
  //   watch("quantity"),
  //   watch("discount"),
  //   watch("unitPrice"),
  // ]);

  const subItems = getValues("subItems");

  if (!modal.isOpen) return;

  const renderProductForm = () => {
    return (
      <form
        key={`form_${refs?.timestamps}`}
        action={onSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 "
      >
        <div className="md:col-span-3 pb-8 mb-4 flex items-end space-x-2 border-dashed border-b-2">
          <div className="flex-1">
            {/* Hidden input to store the product ID for form submission */}
            <input
              type="hidden"
              id="hiddenProductId"
              {...register("productId")}
            />
            <input
              type="hidden"
              id="hiddenProductType"
              {...register("productType")}
            />
            <FormSearchAsync
              id="productId"
              label="ค้นหาชื่อสินค้า/บริการ"
              required
              disabled={!!isLocked}
              config={{
                endpoint: "products",
                params: {},
                customRender: (data: ProductWithRelations) => {
                  return {
                    value: data.id,
                    label: `[${data.type}] : ${data.name} (${data.vendor?.name})`,
                    data: data,
                  };
                },
              }}
              defaultValue={{
                id: defaultData?.product.id,
                label: defaultData?.product.name,
              }}
              onSelected={(item) => {
                // Update hidden input when product is selected
                setValue("productId", item.data.id);
                setValue("name", item.data.name);
                setValue("percentage", item.data.percentage);
                setValue("cost", item.data.cost);
                setValue("description", item.data.description);
                setValue("unit", item.data.unit);
                setValue("productType", item.data.type);
              }}
              errors={fieldErrors}
            />
          </div>
          <div className="h-full flex items-end -mb-0.5">
            <Button
              variant="secondary"
              className="h-10"
              onClick={handleOpenProductModal}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="md:col-span-3 ">
          <FormInput
            id="groupName"
            label="ชื่อกลุ่ม (แสดงในใบเสนอราคา PDF)"
            type="text"
            readOnly={!!isLocked}
            register={register}
            defaultValue={defaultData?.groupName}
            errors={fieldErrors}
          />
        </div>

        <div className="md:col-span-3 ">
          <FormInput
            id="name"
            label="ชื่อสินค้า/บริการ (แสดงในใบเสนอราคา PDF)"
            type="text"
            readOnly={!!isLocked}
            register={register}
            defaultValue={defaultData?.name}
            errors={fieldErrors}
          />
        </div>

        <div className="">
          <FormInput
            key={`cost_${refs?.timestamps}`}
            id="cost"
            label="ต้นทุน"
            required
            readOnly={!!isLocked}
            step="0.01"
            register={register}
            type="number"
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            key={`percentage_${refs?.timestamps}`}
            id="percentage"
            label="กำไรโดยประมาณ (%)"
            required
            type="number"
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            key={`unitPrice_${refs?.timestamps}`}
            id="unitPrice"
            label="ราคาขายต่อหน่วย"
            required
            type="number"
            readOnly={!!isLocked}
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            key={`quantity_${refs?.timestamps}`}
            id="quantity"
            label="จำนวน"
            required
            readOnly={!!isLocked}
            type="number"
            register={register}
            defaultValue={defaultData?.quantity}
            errors={fieldErrors}
          />
        </div>

        <div className="">
          <FormInput
            key={`unit_${refs?.timestamps}`}
            id="unit"
            label="หน่วย"
            required
            readOnly={!!isLocked}
            register={register}
            defaultValue={defaultData?.unit}
            errors={fieldErrors}
          />
        </div>

        <div className="">
          <FormInput
            key={`withholdingTaxPercent_${refs?.timestamps}`} // need to change to vat
            id="withholdingTaxPercent"
            label="ภาษี (%)"
            type="number"
            readOnly
            register={register}
            defaultValue="7"
            errors={fieldErrors}
          />
        </div>

        <div className="">
          <FormInput
            key={`withholdingTax_${refs?.timestamps}`} // need to change to vat
            id="withholdingTax"
            label="ภาษีทั้งหมด"
            type="number"
            readOnly
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            key={`discount_${refs?.timestamps}`}
            id="discount"
            label="ส่วนลด"
            type="number"
            readOnly={!!isLocked}
            register={register}
            // defaultValue={defaultData?.withholdingTax}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            key={`totalPrice_${refs?.timestamps}`}
            id="totalPrice"
            label="ยอดรวม"
            required
            type="number"
            register={register}
            readOnly
            className="bg-green-50"
            // defaultValue={defaultData?.withholdingTax}
            errors={fieldErrors}
          />
        </div>

        <div className="md:col-span-3">
          <FormTextarea
            key={`description_${refs?.timestamps}`}
            id="description"
            label="รายละเอียด"
            errors={fieldErrors}
            register={register}
            defaultValue={defaultData?.description ?? ""}
            rows={6}
          />
        </div>

        <div className="md:col-span-3 col-span-1">
          <SubItems setValue={setValue} defaultSubItems={subItems} />
        </div>

        <div className="md:col-start-3 col-span-1 flex justify-end space-x-3">
          {!isLocked && defaultData?.id && (
            <ConfirmActionButton
              onConfirm={() =>
                handleDelete.execute({
                  id: defaultData.id,
                })
              }
            >
              <Button variant="link" size="sm" className="text-red-500">
                ลบ
              </Button>
            </ConfirmActionButton>
          )}
          <FormSubmit>{defaultData?.id ? "อัพเดท" : "สร้างใหม่"}</FormSubmit>
        </div>
      </form>
    );
  };

  // show errors
  console.log("fieldErrors", fieldErrors);

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent
        className={`sm:max-w-[425px] md:max-w-[600px] ${
          isHidden ? "opacity-0 pointer-events-none" : "opacity-100"
        } transition-opacity duration-200`}
      >
        <DialogHeader>
          <DialogTitle className="space-x-2">
            <span>รายละเอียดสินค้าในใบ QT</span>
            {refs?.quotationRef.type && (
              <span
                className={classNames(
                  "ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ",
                  isProduct
                    ? "bg-gray-100 text-gray-800"
                    : "bg-green-100 text-green-800"
                )}
              >
                {quotationTypeMapping[refs?.quotationRef.type]}
              </span>
            )}

            {isLocked && (
              <Badge variant="outline" className="text-xs text-orange-400">
                <span>แก้ได้เฉพาะรายละเอียดเท่านั้น</span>
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        {renderProductForm()}
      </DialogContent>
    </Dialog>
  );
};

const SubItems = ({
  setValue,
  defaultSubItems,
}: {
  setValue: any;
  defaultSubItems: string;
}) => {
  const [subItems, setSubItems] = useState<
    | {
        label: string;
        quantity: string;
      }[]
    | null
  >(null);

  useEffect(() => {
    if (!defaultSubItems) return;
    setSubItems(JSON.parse(defaultSubItems));
  }, [defaultSubItems]);

  const handleAdd = () => {
    setSubItems([...(subItems || []), { label: "", quantity: "" }]);
  };

  const handleRemove = (index: number) => {
    const items = subItems?.filter((_, i) => i !== index);
    setSubItems(items ?? []);
    setValue("subItems", JSON.stringify(items));
  };

  const handleSubItemChange = (index: number, key: string, value: string) => {
    const items = subItems?.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [key]: value,
        };
      }
      return item;
    });
    setSubItems(items ?? []);
    setValue("subItems", JSON.stringify(items));
  };

  return (
    <div className="">
      <div className="flex space-x-2 items-center ">
        <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs capitalize">
          รายละเอียดย่อย
        </h3>
        <PlusCircle onClick={handleAdd} className=" w-4  cursor-pointer">
          Add
        </PlusCircle>
      </div>
      <div className="mt-2">
        {subItems?.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input
              id="label"
              placeholder="รายการ"
              value={item.label}
              onChange={(e) =>
                handleSubItemChange(index, "label", e.target.value)
              }
            />
            <Input
              id="quantity"
              placeholder="จำนวน"
              value={item.quantity}
              onChange={(e) =>
                handleSubItemChange(index, "quantity", e.target.value)
              }
              className="w-20"
            />
            <MinusCircle
              onClick={() => handleRemove(index)}
              className="text-red-300 w-5  hover:text-red-400 cursor-pointer"
            >
              ลบ
            </MinusCircle>
          </div>
        ))}
      </div>
    </div>
  );
};
