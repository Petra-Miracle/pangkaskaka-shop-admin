"use client";

import dynamic from "next/dynamic";
import { Transaction } from "@/lib/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  transactions: Transaction[];
  loading?: boolean;
}

export function RevenueBarChart({ transactions, loading }: Props) {
  const now = new Date();
  const days: { label: string; date: string; income: number; expense: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
    days.push({ label, date: key, income: 0, expense: 0 });
  }

  for (const tx of transactions) {
    const dateKey = tx.created_at.slice(0, 10);
    const bucket = days.find((d) => d.date === dateKey);
    if (!bucket) continue;
    if (tx.type === "income") bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  const categories = days.map((d) => d.label);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: false,
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) =>
          val >= 1_000_000
            ? `${(val / 1_000_000).toFixed(1)}jt`
            : val >= 1_000
              ? `${(val / 1_000).toFixed(0)}rb`
              : val.toLocaleString("id-ID"),
      },
    },
    colors: ["#10B981", "#EF4444"],
    legend: { position: "bottom", fontSize: "12px" },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "50%" },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ["transparent"] },
    grid: { borderColor: "var(--color-border)" },
    tooltip: {
      y: {
        formatter: (val: number) =>
          `Rp ${val.toLocaleString("id-ID")}`,
      },
    },
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Revenue 7 Hari
        </p>
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      </div>
    );
  }

  const hasData = days.some((d) => d.income > 0 || d.expense > 0);
  if (!hasData) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Revenue 7 Hari
        </p>
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          Belum ada data
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Revenue 7 Hari
      </p>
      <Chart
        options={options}
        series={[
          { name: "Pendapatan", data: days.map((d) => d.income) },
          { name: "Pengeluaran", data: days.map((d) => d.expense) },
        ]}
        type="bar"
        height={220}
      />
    </div>
  );
}
