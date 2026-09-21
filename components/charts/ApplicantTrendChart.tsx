"use client";

import dynamic from "next/dynamic";
import { KaryawanApplication } from "@/lib/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  applicants: KaryawanApplication[];
  loading?: boolean;
}

export function ApplicantTrendChart({ applicants, loading }: Props) {
  const now = new Date();
  const months: { label: string; key: string; count: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    months.push({ label, key, count: 0 });
  }

  for (const a of applicants) {
    const dateKey = a.created_at.slice(0, 7);
    const bucket = months.find((m) => m.key === dateKey);
    if (bucket) bucket.count++;
  }

  const categories = months.map((m) => m.label);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: { style: { fontSize: "11px" } },
    },
    colors: ["#6366F1"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    grid: { borderColor: "var(--color-border)" },
    tooltip: { y: { formatter: (val: number) => `${val} pelamar` } },
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Tren Pelamar (6 Bulan)
        </p>
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      </div>
    );
  }

  const hasData = months.some((m) => m.count > 0);
  if (!hasData) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Tren Pelamar (6 Bulan)
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
        Tren Pelamar (6 Bulan)
      </p>
      <Chart
        options={options}
        series={[{ name: "Pelamar", data: months.map((m) => m.count) }]}
        type="area"
        height={220}
      />
    </div>
  );
}
