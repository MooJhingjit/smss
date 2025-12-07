import { PurchaseOrderWithRelations } from "@/types";
import React, { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import { updatePurchaseOrder } from "@/actions/po/update";
import { toast } from "sonner";

type FormInput = {
    price: number;
    tax: number;
    vat: number;
    grandTotal: number;
    totalPrice: number;
};

type UseBillingInfoProps = {
    data: PurchaseOrderWithRelations;
};

export default function useBillingInfo({ data }: UseBillingInfoProps) {
    const isManual = data.quotationId
    const {
        register,
        reset,
        getValues,
        setValue,
        handleSubmit,
        control,
        formState: { isDirty, errors },
    } = useForm<FormInput>({
        mode: 'onChange',
        defaultValues: {
            price: data.price ?? 0,
            totalPrice: data.totalPrice ?? 0,
            tax: data.tax ?? 0,
            vat: data.vat ?? 0,
            grandTotal: data.grandTotal ?? 0,
        },
    });

    // discount and extraCost are now calculated from PurchaseOrderItem, so they are read-only
    const discount = data.discount ?? 0;
    const extraCost = data.extraCost ?? 0;

    useEffect(() => {
        reset({
            price: data.price ?? 0,
            totalPrice: data.totalPrice ?? 0,
            tax: data.tax ?? 0,
            vat: data.vat ?? 0,
            grandTotal: data.grandTotal ?? 0,
        });
    }, [data, reset]);

    const onChange = useCallback(() => {
        let tPrice = data.price ?? 0;

        if (isManual) {
            tPrice = Number(getValues('price'));
        }

        const totalPrice = tPrice - discount + extraCost;
        const vat = totalPrice * 0.07;

        setValue('totalPrice', totalPrice);
        setValue('grandTotal', totalPrice + vat);
        setValue('vat', vat);
    }, [getValues, setValue, data.price, isManual, discount, extraCost]);

    const price = useWatch({ name: 'price', control });
    const vat = useWatch({ name: 'vat', control });
    const grandTotal = useWatch({ name: 'grandTotal', control });

    const handleUpdate = useAction(updatePurchaseOrder, {
        onSuccess: () => {
            toast.success('สำเร็จ');
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onSubmit = (formData: FormInput) => {
        handleUpdate.execute({
            ...formData,
            totalPrice: Number(formData.totalPrice),
            price: Number(formData.price),
            id: data.id,
            formType: 'billing',
        });
    };

    const onReset = () => {
        reset();
    };

    useEffect(() => {
        if (isDirty) {
            onChange();
        }
    }, [price, isDirty, onChange]);

    const priceBeforeVat = getValues('totalPrice');

    return {
        register,
        reset,
        handleSubmit,
        control,
        isDirty,
        discount,
        extraCost,
        price,
        vat,
        grandTotal,
        onReset,
        onSubmit,
        priceBeforeVat,
        isManual
    };
}
