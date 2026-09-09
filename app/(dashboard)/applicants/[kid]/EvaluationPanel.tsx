"use client";

import { useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  EVALUATION_LABELS,
  EVALUATION_WEIGHT_FIELDS,
  EvaluationWeights,
  KaryawanApplication,
} from "@/lib/types";
import { Button } from "@/components/ui/button";

const PASSING_SCORE = 60;

function predictSkillLevel(total: number) {
  if (total >= 85) return "Senior";
  if (total >= 70) return "Standar";
  return "Junior";
}

export default function EvaluationPanel({
  applicant,
  onEvaluated,
}: {
  applicant: KaryawanApplication;
  onEvaluated: (patch: Partial<KaryawanApplication>) => void;
}) {
  const canEvaluate =
    applicant.status === "menunggu_tes" ||
    applicant.status === "seleksi_berkas_lolos";
  const hasResult =
    (applicant.status === "active" || applicant.status === "rejected") &&
    !!applicant.evaluated_at;

  const [weights, setWeights] = useState<EvaluationWeights>({
    portfolio_weight: 0,
    experience_weight: 0,
    tools_weight: 0,
    bnsp_weight: 0,
    cert_weight: 0,
    diploma_weight: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => EVALUATION_WEIGHT_FIELDS.reduce((sum, key) => sum + (weights[key] || 0), 0),
    [weights]
  );

  if (!canEvaluate && !hasResult) return null;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<{ ok: boolean; total_score: number; status: string }>(
        `/shop-admin/karyawan/${applicant.id}/evaluate`,
        weights
      );
      onEvaluated({
        ...weights,
        total_score: res.total_score,
        status: res.status as KaryawanApplication["status"],
        evaluated_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan evaluasi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (hasResult) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Hasil Evaluasi
        </h2>
        <div className="space-y-2">
          {EVALUATION_WEIGHT_FIELDS.map((key) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{EVALUATION_LABELS[key]}</span>
              <span className="font-semibold text-foreground">
                {applicant[key] ?? 0} / 20
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-bold text-foreground">Total Skor</span>
          <span className="text-xl font-extrabold text-primary">
            {applicant.total_score}
          </span>
        </div>
        <p
          className="mt-2 text-sm font-semibold"
          style={{
            color:
              applicant.status === "active"
                ? "var(--color-success)"
                : "var(--color-error)",
          }}
        >
          Hasil akhir: {applicant.status === "active" ? "StreetBarber Aktif" : "Ditolak"}
        </p>
      </div>
    );
  }

  const willPass = total >= PASSING_SCORE;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Evaluasi Tes Keterampilan
      </h2>

      <div className="space-y-4">
        {EVALUATION_WEIGHT_FIELDS.map((key) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <label className="font-medium text-muted-foreground">
                {EVALUATION_LABELS[key]}
              </label>
              <span className="font-bold text-foreground">{weights[key]} / 20</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={weights[key]}
              onChange={(e) =>
                setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }))
              }
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Total Skor</span>
          <span className="text-2xl font-extrabold text-foreground">{total} / 120</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Prediksi hasil (batas lolos {PASSING_SCORE})</span>
          <span
            className="font-bold"
            style={{ color: willPass ? "var(--color-success)" : "var(--color-error)" }}
          >
            {willPass ? "AKTIF" : "DITOLAK"}
          </span>
        </div>
        {willPass && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prediksi level (non-final)</span>
            <span className="font-semibold text-foreground">{predictSkillLevel(total)}</span>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <Button className="mt-4 shadow-glow" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "Menyimpan..." : "Simpan Evaluasi"}
      </Button>
    </div>
  );
}
