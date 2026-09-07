"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { KaryawanApplication } from "@/lib/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface DocField {
  key: keyof KaryawanApplication;
  label: string;
  kind: "image" | "link" | "text";
  optional?: boolean;
}

const DOC_FIELDS: DocField[] = [
  { key: "ktp_photo", label: "Foto KTP", kind: "image" },
  { key: "diploma_photo", label: "Foto Ijazah", kind: "image", optional: true },
  { key: "portfolio_url", label: "Portofolio", kind: "link", optional: true },
  { key: "tools_photo", label: "Foto Kelengkapan Alat", kind: "image", optional: true },
  { key: "bnsp_cert", label: "Sertifikat BNSP", kind: "link", optional: true },
  { key: "certificates", label: "Sertifikat Lainnya", kind: "text", optional: true },
];

export default function BerkasReview({
  applicant,
  onDecided,
}: {
  applicant: KaryawanApplication;
  onDecided: (patch: Partial<KaryawanApplication>) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState<"lolos" | "tolak" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPending = applicant.status === "pending";

  async function decide(decision: "lolos" | "tolak") {
    if (decision === "tolak" && !reason.trim()) {
      setError("Alasan penolakan wajib diisi agar pelamar mengetahui kekurangannya.");
      return;
    }
    setError(null);
    setSubmitting(decision);
    try {
      const res = await api.post<{ ok: boolean; status: string }>(
        `/shop-admin/karyawan/${applicant.id}/berkas-decision`,
        { decision, reason: reason.trim() || undefined }
      );
      onDecided({
        status: res.status as KaryawanApplication["status"],
        berkas_reviewed_at: new Date().toISOString(),
        berkas_reason: reason.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan keputusan.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-text-dim">
        Berkas Pelamar
      </h2>

      <div className="mb-4 rounded-md bg-surface-2 p-3 text-sm">
        <p className="font-semibold text-text">Pengalaman Kerja</p>
        <p className="mt-1 whitespace-pre-wrap text-text-muted">
          {applicant.work_experience || "-"}
        </p>
        <p className="mt-2 text-xs text-text-dim">
          Menyetujui kriteria StreetBarber:{" "}
          <span className="font-semibold">
            {applicant.criteria_agreed ? "Ya" : "Tidak"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DOC_FIELDS.map((field) => {
          const value = applicant[field.key] as string;
          return (
            <div key={field.key} className="rounded-md border border-border p-3">
              <p className="mb-1.5 text-xs font-semibold text-text-dim">
                {field.label}
              </p>
              {!value ? (
                <p className="text-sm text-text-dim">
                  {field.optional ? "Tidak dilampirkan" : "Belum ada"}
                </p>
              ) : field.kind === "image" ? (
                <a href={value} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt={field.label}
                    className="h-32 w-full rounded-sm object-cover"
                  />
                </a>
              ) : field.kind === "link" ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-medium text-brand hover:underline"
                >
                  {value}
                </a>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-text-muted">
                  {value}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {isPending ? (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Alasan (wajib jika menolak berkas)"
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
          {error && <p className="text-sm font-medium text-error">{error}</p>}
          <div className="flex gap-3">
            <Button
              variant="success"
              loading={submitting === "lolos"}
              disabled={submitting !== null}
              onClick={() => decide("lolos")}
            >
              Setujui Berkas
            </Button>
            <Button
              variant="danger"
              loading={submitting === "tolak"}
              disabled={submitting !== null}
              onClick={() => decide("tolak")}
            >
              Tolak Berkas
            </Button>
          </div>
        </div>
      ) : (
        applicant.berkas_reviewed_at && (
          <div className="mt-5 border-t border-border pt-4 text-sm">
            <p className="font-semibold text-text">
              Berkas telah ditinjau pada{" "}
              {new Date(applicant.berkas_reviewed_at).toLocaleString("id-ID")}
            </p>
            {applicant.berkas_reason && (
              <p className="mt-1 text-text-dim">
                Catatan: {applicant.berkas_reason}
              </p>
            )}
          </div>
        )
      )}
    </Card>
  );
}
