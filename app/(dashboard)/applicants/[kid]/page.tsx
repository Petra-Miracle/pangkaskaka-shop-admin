"use client";

import { use } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants } from "@/contexts/ApplicantsContext";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import BerkasReview from "./BerkasReview";
import EvaluationPanel from "./EvaluationPanel";
import ChatPanel from "./ChatPanel";

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ kid: string }>;
}) {
  const { kid } = use(params);
  const { shopsById } = useAuth();
  const { applicants, loading, error, updateLocal } = useApplicants();

  const applicant = applicants.find((a) => a.id === kid);

  if (loading) {
    return <Card className="text-center text-sm text-text-dim">Memuat...</Card>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-error">
        {error}
      </div>
    );
  }

  if (!applicant) {
    return (
      <Card className="text-center">
        <p className="font-semibold text-text">Pelamar tidak ditemukan.</p>
        <p className="mt-1 text-sm text-text-dim">
          Pelamar ini mungkin bukan bagian dari toko yang Anda kelola, atau
          sudah dihapus.
        </p>
        <Link
          href="/applicants"
          className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
        >
          Kembali ke daftar pelamar
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/applicants"
          className="text-sm font-medium text-text-dim hover:text-brand"
        >
          ← Kembali ke daftar pelamar
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-text">{applicant.name}</h1>
            <p className="text-sm text-text-dim">
              {shopsById[applicant.shop_id]?.name || applicant.shop_id} &middot;{" "}
              {applicant.email} &middot; {applicant.phone}
            </p>
          </div>
          <StatusBadge status={applicant.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <BerkasReview
            applicant={applicant}
            onDecided={(patch) => updateLocal(applicant.id, patch)}
          />
          <EvaluationPanel
            applicant={applicant}
            onEvaluated={(patch) => updateLocal(applicant.id, patch)}
          />
        </div>
        <ChatPanel applicant={applicant} />
      </div>
    </div>
  );
}
