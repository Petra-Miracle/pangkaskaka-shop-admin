"use client";

import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface RevenueTableProps {
  transactions: Transaction[];
  loading: boolean;
}

export function RevenueTable({ transactions, loading }: RevenueTableProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl">
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="font-semibold text-foreground">
          Belum ada transaksi.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Data transaksi akan muncul setelah ada aktivitas keuangan.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead>Dicatat Oleh</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-muted-foreground">
                {formatDate(tx.created_at)}
              </TableCell>
              <TableCell className="font-medium max-w-[250px] truncate">
                {tx.description}
              </TableCell>
              <TableCell>
                {tx.category ? (
                  <Badge variant="outline">{tx.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {tx.type === "income" ? (
                  <Badge className="bg-success/15 text-success">Pendapatan</Badge>
                ) : (
                  <Badge className="bg-error/15 text-error">Pengeluaran</Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span
                  className={
                    tx.type === "income" ? "text-success" : "text-destructive"
                  }
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatRupiah(tx.amount)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {tx.recorded_by_role}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
