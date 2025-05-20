import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormTextarea } from "@/components/form/form-textarea";
import { useAction } from "@/hooks/use-action";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { debounce } from "@/lib/utils";
import { updateQuotation } from "@/actions/quotation/update";

type FormRemark = {
    id: number;
    remark: string | null;
};

const Remarks = ({ id, remark }: { id: number; remark: string | null }) => {
    const [isSuccess, setIsSuccess] = React.useState(false);
    const {
        register,
        watch,
        reset,
        getValues,
    } = useForm<FormRemark>({
        mode: "onChange",
        defaultValues: {
            remark: remark ?? "",
        },
    });

    useEffect(() => {
        reset({ remark: remark ?? "" });
    }, [remark, reset]);

    const { execute, isLoading } = useAction(updateQuotation, {
        onSuccess: (data) => {
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 1000);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onSubmit = async () => {
        const remark = getValues("remark") ?? "";
        execute({ id, remark });
    };

    const handleSubmit = useCallback(
        debounce(
            onSubmit,
            500,
        ),
        [],
    );

    const watchedRemark = watch("remark");
    useEffect(() => {
        handleSubmit();
    }, [watchedRemark, handleSubmit]);


    return (
        <form className="relative h-full">
            <div className="absolute top-2 right-2">
                {
                    isLoading && <LoaderIcon className="animate-spin text-gray-400" size={20} />
                }
                {
                    isSuccess && <CheckIcon size={16} className="text-gray-400" />
                }
            </div>
            <FormTextarea
                id="remark"
                placeholder="หมายเหตุ"
                className="w-full h-full border  rounded-lg"
                register={register}
                rows={12}
            />
        </form>
    );
};

export default Remarks;