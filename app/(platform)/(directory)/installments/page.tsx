
import Breadcrumbs from "@/components/breadcrumbs";
import { columns } from "./_components/columns";
import InstallmentTable from "./_components/data-table";
import { db } from "@/lib/db";
import { getDateFormat } from "@/lib/utils";

async function getData(): Promise<any[]> {
  const quotations = await db.quotation.findMany({
    where: {
      installments: {
        some: {}, // Only quotations that have installments
      },
    },
    include: {
      contact: {
        select: {
          name: true,
        },
      },
      installments: {
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate installment summaries
  const quotationsWithSummary = quotations.map((quotation) => {
    const today = new Date();
    const totalInstallments = quotation.installments.length;
    const paidInstallments = quotation.installments.filter(i => i.status === "paid").length;
    const overdueInstallments = quotation.installments.filter(i => {
      const dueDate = new Date(i.dueDate);
      return i.status === "pending" && dueDate < today;
    }).length;
    
    const totalAmount = quotation.installments.reduce((sum, i) => sum + i.amount, 0);
    const totalAmountWithVat = quotation.installments.reduce((sum, i) => sum + i.amountWithVat, 0);
    const paidAmount = quotation.installments
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + i.amount, 0);
    const paidAmountWithVat = quotation.installments
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + i.amountWithVat, 0);
    
    const nextDueDate = quotation.installments
      .filter(i => i.status === "pending")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate;

    return {
      ...quotation,
      installmentSummary: {
        totalInstallments,
        paidInstallments,
        overdueInstallments,
        totalAmount,
        totalAmountWithVat,
        paidAmount,
        paidAmountWithVat,
        remainingAmount: totalAmount - paidAmount,
        remainingAmountWithVat: totalAmountWithVat - paidAmountWithVat,
        nextDueDate,
        paymentProgress: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
      },
    };
  });

  return quotationsWithSummary;
}

export default async function AllQuotationInstallments() {
  const data = await getData();

  // Format the dates
  const formattedData = data.map((quotation) => ({
    ...quotation,
    installmentSummary: {
      ...quotation.installmentSummary,
      nextDueDate: quotation.installmentSummary.nextDueDate 
        ? getDateFormat(quotation.installmentSummary.nextDueDate) 
        : null,
    },
  }));

  const pages = [
    {
      name: "แผนการผ่อนชำระทั้งหมด",
      href: "/installments",
      current: true,
    },
  ];

  return (
    <>
      <Breadcrumbs pages={pages} />
      <InstallmentTable columns={columns} data={formattedData} />
    </>
  );
}
