import { ApplicantStatus } from "@/lib/types";

const STATUS_MAP: Record<
  ApplicantStatus,
  { label: string; bg: string; color: string }
> = {
  pending: { label: "MENUNGGU BERKAS", bg: "#FFF7ED", color: "var(--color-warning)" },
  menunggu_tes: { label: "TAHAP TES", bg: "#EFF8FF", color: "var(--color-info)" },
  seleksi_berkas_lolos: {
    label: "TAHAP TES",
    bg: "#EFF8FF",
    color: "var(--color-info)",
  },
  active: { label: "STREETBARBER AKTIF", bg: "#ECFDF5", color: "var(--color-success)" },
  rejected: { label: "DITOLAK", bg: "#FEF2F2", color: "var(--color-error)" },
};

export default function StatusBadge({ status }: { status: ApplicantStatus }) {
  const meta = STATUS_MAP[status] ?? {
    label: status,
    bg: "#F3F3F4",
    color: "var(--color-text-dim)",
  };

  return (
    <span
      className="inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-bold tracking-wide"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}
