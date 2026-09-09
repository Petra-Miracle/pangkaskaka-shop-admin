"use client";

import { RevenueSummary } from "@/lib/types";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface RevenueSummaryCardsProps {
  summary: RevenueSummary | null;
  loading: boolean;
}

export function RevenueSummaryCards({ summary, loading }: RevenueSummaryCardsProps) {
  const cards = [
    {
      label: "Total Pendapatan",
      value: summary?.total_income ?? 0,
      icon: TrendingUp,
      color: "var(--color-success)",
      bgColor: "bg-success/10",
    },
    {
      label: "Total Pengeluaran",
      value: summary?.total_expense ?? 0,
      icon: TrendingDown,
      color: "var(--color-error)",
      bgColor: "bg-error/10",
    },
    {
      label: "Laba Bersih",
      value: summary?.net_profit ?? 0,
      icon: Wallet,
      color: "var(--color-info)",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-card card-glow rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {card.label}
            </p>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className="size-4" style={{ color: card.color }} />
            </div>
          </div>
          <p
            className="mt-2 text-2xl font-extrabold"
            style={{ color: card.color }}
          >
            {loading ? (
              <span className="inline-block h-7 w-24 animate-pulse rounded bg-muted" />
            ) : (
              formatRupiah(card.value)
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
