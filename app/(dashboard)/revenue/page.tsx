"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Transaction, RevenueSummary, TransactionType } from "@/lib/types";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevenueSummaryCards } from "./RevenueSummaryCards";
import { RevenueTable } from "./RevenueTable";
import { Eye } from "lucide-react";

export default function RevenuePage() {
  const { user, shopsById } = useAuth();
  const managedShopIds = user?.managed_shop_ids || [];
  const [selectedShopId, setSelectedShopId] = useState(managedShopIds[0] || "");

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    if (!selectedShopId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("shop_id", selectedShopId);
      if (filterType !== "all") params.set("type", filterType);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      const query = params.toString();
      const [summaryRes, txRes] = await Promise.all([
        api.get<RevenueSummary>(
          `/shop-admin/revenue/summary?${query}`
        ),
        api.get<{ transactions: Transaction[] }>(
          `/shop-admin/revenue?${query}`
        ),
      ]);
      setSummary(summaryRes);
      setTransactions(txRes.transactions || []);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal memuat data keuangan."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedShopId, filterType, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Keuangan"
        title="Revenue"
        description="Data keuangan toko — hanya untuk dibaca."
      />

      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          {managedShopIds.length > 1 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Toko</Label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {managedShopIds.map((id) => (
                  <option key={id} value={id}>
                    {shopsById[id]?.name || id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Dari Tanggal</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[160px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Sampai Tanggal</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[160px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tipe</Label>
            <div className="flex gap-1">
              {(
                [
                  { value: "all", label: "Semua" },
                  { value: "income", label: "Pendapatan" },
                  { value: "expense", label: "Pengeluaran" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterType === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            Muat Ulang
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5" />
          <span>Admin hanya dapat melihat data. Hubungi Owner untuk perubahan.</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <RevenueSummaryCards summary={summary} loading={loading} />
      <RevenueTable transactions={transactions} loading={loading} />
    </div>
  );
}
