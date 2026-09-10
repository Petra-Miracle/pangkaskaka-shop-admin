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
import * as XLSX from "xlsx-js-style";

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

    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const formatDateFile = (d: string) => {
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const dateLabel =
      startDate && endDate && startDate === endDate
        ? formatDate(startDate)
        : startDate && endDate
          ? `${formatDate(startDate)} - ${formatDate(endDate)}`
          : startDate
            ? `${formatDate(startDate)} - Sekarang`
            : endDate
              ? `Sampai ${formatDate(endDate)}`
              : "Semua Periode";

    const fileNameDate =
      startDate && endDate && startDate === endDate
        ? formatDateFile(startDate)
        : startDate && endDate
          ? `${formatDateFile(startDate)}_sd_${formatDateFile(endDate)}`
          : startDate
            ? `${formatDateFile(startDate)}_sd_sekarang`
            : endDate
              ? `sd_${formatDateFile(endDate)}`
              : "semua";

    const filterLabel =
      filterType === "income"
        ? "Pendapatan"
        : filterType === "expense"
          ? "Pengeluaran"
          : "Semua";

    const shopName = shopsById[selectedShopId]?.name || selectedShopId;
    const shopNameFile = shopName.replace(/\s+/g, "_");

    const txHeaderRow = 17;
    const txStartRow = 18;
    const txEndRow = txStartRow + transactions.length - 1;

    const rows: (string | number | { f: string })[][] = [
      ["LAPORAN KEUANGAN TOKO"],                                           // Row 1
      [""],                                                                // Row 2
      ["Toko", shopName],                                                 // Row 3
      ["Periode", dateLabel],                                             // Row 4
      ["Filter", filterLabel],                                            // Row 5
      [""],                                                                // Row 6
      [""],                                                                // Row 7
      ["RINGKASAN KEUANGAN"],                                             // Row 8
      [""],                                                                // Row 9
      ["Keterangan", "Jumlah"],                                           // Row 10
      ["Total Pendapatan (Pemasukan)", { f: `SUMIF(D${txHeaderRow}:D${txEndRow},"Pendapatan",E${txHeaderRow}:E${txEndRow})` }],  // Row 11
      ["Total Pengeluaran (Pengeluaran)", { f: `SUMIF(D${txHeaderRow}:D${txEndRow},"Pengeluaran",E${txHeaderRow}:E${txEndRow})` }],  // Row 12
      ["Laba Bersih", { f: `B11-B12` }],                                  // Row 13
      [""],                                                                // Row 14
      [""],                                                                // Row 15
      ["DATA TRANSAKSI"],                                                 // Row 16
      ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah (Rp)", "Dicatat Oleh"],  // Row 17 (header)
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

    // Auto-fit column widths
    const colWidths = [
      { wch: 38 },  // A: Keterangan/Tanggal
      { wch: 35 },  // B: Jumlah/Deskripsi
      { wch: 15 },  // C: Kategori
      { wch: 14 },  // D: Tipe
      { wch: 18 },  // E: Jumlah (Rp)
      { wch: 15 },  // F: Dicatat Oleh
    ];
    ws["!cols"] = colWidths;

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },   // Title
      { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },   // RINGKASAN KEUANGAN
      { s: { r: 15, c: 0 }, e: { r: 15, c: 5 } },  // DATA TRANSAKSI
    ];

    // Style definitions
    const thinBorder = {
      top: { style: "thin" as const, color: { rgb: "000000" } },
      bottom: { style: "thin" as const, color: { rgb: "000000" } },
      left: { style: "thin" as const, color: { rgb: "000000" } },
      right: { style: "thin" as const, color: { rgb: "000000" } },
    };

    const headerBg = { rgb: "1E3A5F" };
    const sectionBg = { rgb: "E8F0FE" };
    const greenBg = { rgb: "E6F4EA" };
    const redBg = { rgb: "FDECEA" };
    const blueBg = { rgb: "E3F2FD" };

    // Style title row (Row 1)
    const titleCell = ws["A1"];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: headerBg },
        alignment: { horizontal: "center" },
        border: thinBorder,
      };
    }

    // Style RINGKASAN KEUANGAN header (Row 8)
    const ringkasanCell = ws["A8"];
    if (ringkasanCell) {
      ringkasanCell.s = {
        font: { bold: true, sz: 12, color: { rgb: "1E3A5F" } },
        fill: { fgColor: sectionBg },
        border: thinBorder,
      };
    }

    // Style Keterangan header (Row 10)
    const keteranganCell = ws["A10"];
    const jumlahHeaderCell = ws["B10"];
    if (keteranganCell) {
      keteranganCell.s = {
        font: { bold: true },
        fill: { fgColor: sectionBg },
        border: thinBorder,
      };
    }
    if (jumlahHeaderCell) {
      jumlahHeaderCell.s = {
        font: { bold: true },
        fill: { fgColor: sectionBg },
        border: thinBorder,
      };
    }

    // Style Total Pendapatan (Row 11) - Green
    const pendapatanLabelCell = ws["A11"];
    const pendapatanValueCell = ws["B11"];
    if (pendapatanLabelCell) {
      pendapatanLabelCell.s = {
        font: { bold: true, color: { rgb: "137333" } },
        fill: { fgColor: greenBg },
        border: thinBorder,
      };
    }
    if (pendapatanValueCell) {
      pendapatanValueCell.s = {
        font: { bold: true, color: { rgb: "137333" } },
        fill: { fgColor: greenBg },
        border: thinBorder,
        numFmt: "#,##0",
      };
    }

    // Style Total Pengeluaran (Row 12) - Red
    const pengeluaranLabelCell = ws["A12"];
    const pengeluaranValueCell = ws["B12"];
    if (pengeluaranLabelCell) {
      pengeluaranLabelCell.s = {
        font: { bold: true, color: { rgb: "C5221F" } },
        fill: { fgColor: redBg },
        border: thinBorder,
      };
    }
    if (pengeluaranValueCell) {
      pengeluaranValueCell.s = {
        font: { bold: true, color: { rgb: "C5221F" } },
        fill: { fgColor: redBg },
        border: thinBorder,
        numFmt: "#,##0",
      };
    }

    // Style Laba Bersih (Row 13) - Blue, larger font
    const labaLabelCell = ws["A13"];
    const labaValueCell = ws["B13"];
    if (labaLabelCell) {
      labaLabelCell.s = {
        font: { bold: true, sz: 12, color: { rgb: "1A73E8" } },
        fill: { fgColor: blueBg },
        border: thinBorder,
      };
    }
    if (labaValueCell) {
      labaValueCell.s = {
        font: { bold: true, sz: 12, color: { rgb: "1A73E8" } },
        fill: { fgColor: blueBg },
        border: thinBorder,
        numFmt: "#,##0",
      };
    }

    // Style DATA TRANSAKSI header (Row 16)
    const dataHeaderCell = ws["A16"];
    if (dataHeaderCell) {
      dataHeaderCell.s = {
        font: { bold: true, sz: 12, color: { rgb: "1E3A5F" } },
        fill: { fgColor: sectionBg },
        border: thinBorder,
      };
    }

    // Style transaction table header (Row 17)
    const txHeaders = ["A17", "B17", "C17", "D17", "E17", "F17"];
    for (const ref of txHeaders) {
      const cell = ws[ref];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: headerBg },
          border: thinBorder,
          alignment: { horizontal: "center" },
        };
      }
    }

    // Style transaction data rows
    for (let i = txStartRow; i <= txEndRow; i++) {
      const row = i;
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = ws[cellRef];
        if (cell) {
          cell.s = {
            border: thinBorder,
            alignment: { horizontal: col === 4 ? "right" : "left" },
          };
        }
      }

      // Color code Tipe column (D)
      const tipeCell = ws[`D${row}`];
      if (tipeCell && tipeCell.v === "Pendapatan") {
        tipeCell.s = {
          ...tipeCell.s,
          font: { bold: true, color: { rgb: "137333" } },
        };
      } else if (tipeCell && tipeCell.v === "Pengeluaran") {
        tipeCell.s = {
          ...tipeCell.s,
          font: { bold: true, color: { rgb: "C5221F" } },
        };
      }

      // Format Jumlah column (E) as currency
      const jumlahCell = ws[`E${row}`];
      if (jumlahCell) {
        jumlahCell.s = {
          ...jumlahCell.s,
          numFmt: "#,##0",
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");

    const fileName = `Revenue_${shopNameFile}_${fileNameDate}.xlsx`;
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
