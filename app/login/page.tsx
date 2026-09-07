"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal masuk. Periksa email dan kata sandi Anda."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A2540] via-[#0F2E4F] to-[#1B4A7A] px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xl font-extrabold text-text">PangkasKAKA</p>
          <p className="mt-1 text-sm text-text-dim">
            Portal Admin Validator StreetBarber
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-dim"
              placeholder="admin@pangkaskaka.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-dim"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-md bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-medium text-error">
              {error}
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-dim">
          Akun Admin hanya dapat dibuat oleh SuperAdmin. Hubungi SuperAdmin
          jika Anda belum memiliki akun.
        </p>
      </div>
    </div>
  );
}
