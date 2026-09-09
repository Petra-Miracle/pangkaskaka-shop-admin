"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="bg-animated-mesh relative flex min-h-screen overflow-hidden">
      <div className="bg-noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 -left-32 size-[28rem] animate-float-soft rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 size-[30rem] animate-float-soft rounded-full bg-violet-500/15 blur-3xl [animation-delay:-6s]" />
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-7 flex flex-col items-center text-center animate-fade-up">
            <div className="relative mb-4 flex size-14 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-primary/30 ring-1 ring-white/40 ring-inset animate-float">
              <Image src="/pangkaskaka-logo.svg" alt="PangkasKAKA" fill sizes="56px" className="object-cover" priority />
              <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">PangkasKAKA</h1>
            <p className="mt-1 text-sm text-muted-foreground">Masuk untuk mengelola pengajuan StreetBarber</p>
          </div>

          <div
            className="glass-card card-glow shadow-popover animate-fade-up [animation-delay:80ms]"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
            }}
          >
            <div className="divider-gradient mx-4" />
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      placeholder="admin@pangkaskaka.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 pl-9"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pr-10 pl-9"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={submitting} className="btn-shine relative h-10 w-full gap-2 overflow-hidden shadow-glow">
                  {submitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : null}
                  Masuk
                </Button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground animate-fade-up [animation-delay:160ms]">
            Akses terbatas untuk admin · © {new Date().getFullYear()} PangkasKAKA
          </p>
        </div>
      </div>
    </div>
  );
}
