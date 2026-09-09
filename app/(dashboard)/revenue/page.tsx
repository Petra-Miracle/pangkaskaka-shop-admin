"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Transaction, RevenueSummary, TransactionType } from "@/lib/types";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevenueSummaryCards } from "./RevenueSummaryCards";
import { RevenueTable } from "./RevenueTable";
import { Eye, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function RevenuePage() {
  const { user, shopsById } = useAuth();
  const managedShopIds = user?.managed_shop_ids || [];
  const [selectedShopId, setSelectedShopId] = useState("");

  useEffect(() => {
    if (!selectedShopId && managedShopIds.length > 0) {
      setSelectedShopId(managedShopIds[0]);
    }
  }, [managedShopIds, selectedShopId]);

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    if (!FEATURES.revenue) {
      setLoading(false);
      return;
    }
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
      if (err instanceof ApiError && err.status === 404) {
        setError("Fitur revenue belum tersedia di server.");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Gagal memuat data keuangan."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [selectedShopId, filterType, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (transactions.length === 0) return;

    const dateLabel =
      startDate && endDate
        ? `${new Date(startDate).toLocaleDateString("id-ID")} — ${new Date(endDate).toLocaleDateString("id-ID")}`
        : startDate
          ? `${new Date(startDate).toLocaleDateString("id-ID")} — Sekarang`
          : endDate
            ? `Semua — ${new Date(endDate).toLocaleDateString("id-ID")}`
            : "Semua Periode";

    const filterLabel =
      filterType === "income"
        ? "Pendapatan"
        : filterType === "expense"
          ? "Pengeluaran"
          : "Semua";

    const shopName = shopsById[selectedShopId]?.name || selectedShopId;

    const txStartRow = 16;
    const txEndRow = txStartRow + transactions.length - 1;

    const rows: (string | number | { f: string })[][] = [
      ["LAPORAN KEUANGAN TOKO"],
      [""],
      ["Toko", shopName],
      ["Periode", dateLabel],
      ["Filter", filterLabel],
      [""],
      [""],
      ["RINGKASAN KEUANGAN"],
      [""],
      ["Keterangan", "Jumlah"],
      ["Total Pendapatan (Pemasukan)", { f: `SUMIF(E${txStartRow}:E${txEndRow},"Pendapatan",F${txStartRow}:F${txEndRow})` }],
      ["Total Pengeluaran (Pengeluaran)", { f: `ABS(SUMIF(E${txStartRow}:E${txEndRow},"Pengeluaran",F${txStartRow}:F${txEndRow}))` }],
      ["Laba Bersih", { f: `B10-B11` }],
      [""],
      [""],
      ["DATA TRANSAKSI"],
      ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah (Rp)", "Dicatat Oleh"],
    ];

    for (const tx of transactions) {
      rows.push([
        new Date(tx.created_at).toLocaleDateString("id-ID"),
        tx.description,
        tx.category || "-",
        tx.type === "income" ? "Pendapatan" : "Pengeluaran",
        tx.type === "income" ? tx.amount : -tx.amount,
        tx.recorded_by_role,
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!cols"] = [
      { wch: 35 },
      { wch: 30 },
      { wch: 15 },
      { wch: 14 },
      { wch: 18 },
      { wch: 15 },
    ];

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },
      { s: { r: 15, c: 0 }, e: { r: 15, c: 5 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");

    const fileName = `Revenue_${shopName}_${startDate || "all"}_${endDate || "all"}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || transactions.length === 0}
          >
            <Download className="mr-1.5 size-4" />
            Export Excel
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
