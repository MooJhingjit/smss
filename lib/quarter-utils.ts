// Quarter utility functions for use in both server and client components

// Quarter definitions with Thai labels
export const QUARTERS = [
    { value: 1, label: "ไตรมาส 1 (ม.ค. - มี.ค.)", months: { start: 0, end: 2 } },
    { value: 2, label: "ไตรมาส 2 (เม.ย. - มิ.ย.)", months: { start: 3, end: 5 } },
    { value: 3, label: "ไตรมาส 3 (ก.ค. - ก.ย.)", months: { start: 6, end: 8 } },
    { value: 4, label: "ไตรมาส 4 (ต.ค. - ธ.ค.)", months: { start: 9, end: 11 } },
];

export const QUARTER_LABELS: Record<number, string> = {
    1: "ไตรมาส 1 (ม.ค. - มี.ค.)",
    2: "ไตรมาส 2 (เม.ย. - มิ.ย.)",
    3: "ไตรมาส 3 (ก.ค. - ก.ย.)",
    4: "ไตรมาส 4 (ต.ค. - ธ.ค.)",
};

export function getQuarterDateRange(year: number, quarter: number) {
    const quarterDef = QUARTERS.find((q) => q.value === quarter) || QUARTERS[0];
    const fromDate = new Date(Date.UTC(year, quarterDef.months.start, 1));
    const toDate = new Date(Date.UTC(year, quarterDef.months.end + 1, 0, 23, 59, 59, 999)); // Last day of end month
    return { fromDate, toDate };
}

export function getQuarterFromDate(date: Date): number {
    const month = date.getMonth();
    if (month <= 2) return 1;
    if (month <= 5) return 2;
    if (month <= 8) return 3;
    return 4;
}
