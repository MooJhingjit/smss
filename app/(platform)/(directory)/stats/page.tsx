import { getMonthlyStats, getTotalCounts, getDateRangeStats, getDateRangeTotalCounts, getInstallmentStats } from "@/lib/stats.service";
import { getQuarterDateRange, getQuarterFromDate } from "@/lib/quarter-utils";
import TotalNumber from "./_component/total-number";
import ReportContent from "./_component/report-content";
import { currentUser } from "@/lib/auth";

export default async function StatPage({
  searchParams,
}: {
  searchParams: { year?: string; from?: string; to?: string; quarter?: string };
}) {
  const user = await currentUser();
  const isSeller = user?.role === "seller";

  // If seller, scope to their ID and hide POs. Admin sees all.
  // Note: if user is undefined (not logged in), they might see nothing or public data depending on downstream logic,
  // but this page is likely protected by middleware/layout.
  const sellerId = isSeller && user?.id ? parseInt(user.id) : undefined;
  const includePurchaseOrders = !isSeller;

  // Handle date range, quarter, or year-based filtering
  const hasDateRange = searchParams.from && searchParams.to;
  const hasQuarter = searchParams.quarter !== undefined;

  let data, totals, dateRange, year, quarter, installmentStats;

  if (hasQuarter) {
    // Use quarter filtering
    year = searchParams.year
      ? parseInt(searchParams.year)
      : new Date().getFullYear();
    quarter = parseInt(searchParams.quarter!);

    // Validate quarter (1-4)
    if (quarter < 1 || quarter > 4) {
      quarter = getQuarterFromDate(new Date());
    }

    const { fromDate, toDate } = getQuarterDateRange(year, quarter);
    dateRange = {
      from: fromDate,
      to: toDate,
    };

    data = await getDateRangeStats({
      dateRange,
      includePurchaseOrders,
      sellerId,
    });

    totals = await getDateRangeTotalCounts({
      dateRange,
      includePurchaseOrders,
      sellerId,
    });

    installmentStats = await getInstallmentStats({
      dateRange,
      sellerId,
    });
  } else if (hasDateRange) {
    // Use date range filtering
    // Parse dates and set to end of day for 'to' date to include the entire day
    const fromDate = new Date(searchParams.from!);
    const toDate = new Date(searchParams.to!);
    toDate.setHours(23, 59, 59, 999); // Set to end of day

    dateRange = {
      from: fromDate,
      to: toDate,
    };

    data = await getDateRangeStats({
      dateRange,
      includePurchaseOrders,
      sellerId,
    });

    totals = await getDateRangeTotalCounts({
      dateRange,
      includePurchaseOrders,
      sellerId,
    });

    // For display purposes, use the year from the start date
    year = dateRange.from.getFullYear();
    quarter = getQuarterFromDate(dateRange.from);

    installmentStats = await getInstallmentStats({
      dateRange,
      sellerId,
    });
  } else {
    // Use year-based filtering (existing logic)
    year = searchParams.year
      ? parseInt(searchParams.year)
      : new Date().getFullYear();

    quarter = getQuarterFromDate(new Date());

    dateRange = {
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 31, 23, 59, 59, 999), // End of Dec 31st
    };

    data = await getMonthlyStats({
      year,
      includePurchaseOrders,
      sellerId,
    });

    totals = await getTotalCounts({
      year,
      includePurchaseOrders,
      sellerId,
    });

    installmentStats = await getInstallmentStats({
      year,
      sellerId,
    });
  }

  return (
    <div className="space-y-4">
      <TotalNumber
        year={year}
        dateRange={dateRange}
        hasDateRange={!!hasDateRange}
        hasQuarter={hasQuarter}
        quarter={quarter}
        quotationCount={totals.quotationCount}
        purchaseOrderCount={totals.purchaseOrderCount}
      />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 ">
          <ReportContent
            data={data}
            year={year}
            dateRange={dateRange}
            hasDateRange={!!hasDateRange}
            hasQuarter={hasQuarter}
            quarter={quarter}
            installmentStats={installmentStats}
            includePurchaseOrders={includePurchaseOrders}
            includeInstallments={!isSeller}
          />
        </div>
      </div>
    </div>
  );
}
