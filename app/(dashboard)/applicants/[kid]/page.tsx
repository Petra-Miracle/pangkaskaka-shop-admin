"use client";

import { use } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants, ApplicantsProvider } from "@/contexts/ApplicantsContext";
import { StatusBadge } from "@/components/StatusBadge";
import BerkasReview from "./BerkasReview";
import EvaluationPanel from "./EvaluationPanel";
import ChatPanel from "./ChatPanel";

function ApplicantDetailContent({
  params,
}: {
  params: Promise<{ kid: string }>;
}) {
  const { kid } = use(params);
  const { shopsById } = useAuth();
  const { applicants, loading, error, updateLocal } = useApplicants();

  const applicant = applicants.find((a) => a.id === kid);

  if (loading) {
    return <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">Memuat...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        {error}
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="font-semibold text-foreground">Pelamar tidak ditemukan.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pelamar ini mungkin bukan bagian dari toko yang Anda kelola, atau
          sudah dihapus.
        </p>
        <Link
          href="/applicants"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Kembali ke daftar pelamar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/applicants"
          className="text-sm font-medium text-muted-foreground hover:text-primary"
        >
          ← Kembali ke daftar pelamar
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-foreground">{applicant.name}</h1>
            <p className="text-sm text-muted-foreground">
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

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ kid: string }>;
}) {
  return (
    <ApplicantsProvider>
      <ApplicantDetailContent params={params} />
    </ApplicantsProvider>
  );
}
