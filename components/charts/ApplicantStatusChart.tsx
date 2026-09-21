"use client";

import dynamic from "next/dynamic";
import { ApplicantStatus } from "@/lib/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const STATUS_CONFIG: Record<
  ApplicantStatus,
  { label: string; color: string }
> = {
  pending: { label: "Menunggu Berkas", color: "#F59E0B" },
  menunggu_tes: { label: "Tahap Tes", color: "#3B82F6" },
  seleksi_berkas_lolos: { label: "Tahap Tes", color: "#3B82F6" },
  active: { label: "Aktif", color: "#10B981" },
  rejected: { label: "Ditolak", color: "#EF4444" },
};

interface Props {
  data: Record<ApplicantStatus, number>;
  loading?: boolean;
}

export function ApplicantStatusChart({ data, loading }: Props) {
  const labels: string[] = [];
  const values: number[] = [];
  const colors: string[] = [];

  const seen = new Set<string>();
  for (const [status, count] of Object.entries(data) as [ApplicantStatus, number][]) {
    const cfg = STATUS_CONFIG[status] || { label: status, color: "#6B7280" };
    const key = cfg.label;
    if (seen.has(key)) {
      const idx = labels.indexOf(key);
      if (idx >= 0) values[idx] += count;
    } else {
      seen.add(key);
      labels.push(cfg.label);
      values.push(count);
      colors.push(cfg.color);
    }
  }

  const options: ApexCharts.ApexOptions = {
    chart: { type: "donut", toolbar: { show: false } },
    labels,
    colors,
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => values.reduce((a, b) => a + b, 0).toString(),
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["var(--color-background)"] },
    tooltip: { y: { formatter: (val: number) => `${val} pelamar` } },
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Status Pelamar
        </p>
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          Memuat...
        </div>
      </div>
    );
  }

  if (values.length === 0 || values.every((v) => v === 0)) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Status Pelamar
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
        Status Pelamar
      </p>
      <Chart
        options={options}
        series={values}
        type="donut"
        height={220}
      />
    </div>
  );
}
