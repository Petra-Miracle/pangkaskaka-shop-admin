import { ApplicantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  ApplicantStatus,
  { label: string; className: string }
> = {
  pending: { label: "MENUNGGU BERKAS", className: "bg-warning/15 text-warning" },
  menunggu_tes: { label: "TAHAP TES", className: "bg-info/15 text-info" },
  seleksi_berkas_lolos: {
    label: "TAHAP TES",
    className: "bg-info/15 text-info",
  },
  active: { label: "STREETBARBER AKTIF", className: "bg-success/15 text-success" },
  rejected: { label: "DITOLAK", className: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: { status: ApplicantStatus }) {
  const meta = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}
