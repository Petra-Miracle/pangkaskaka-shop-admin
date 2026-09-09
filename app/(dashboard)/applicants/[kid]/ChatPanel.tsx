"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { CHAT_ALLOWED_STATUSES, KaryawanApplication, RecruitmentMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 4000;

export default function ChatPanel({ applicant }: { applicant: KaryawanApplication }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RecruitmentMessage[]>([]);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const enabled = CHAT_ALLOWED_STATUSES.includes(applicant.status);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ messages: RecruitmentMessage[] }>(
          `/recruitment/${applicant.id}/messages`
        );
        if (!cancelled) setMessages(res.messages || []);
      } catch {
        // silent on poll failures
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [applicant.id, enabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    setError(null);
    setSending(true);
    try {
      const res = await api.post<{ message: RecruitmentMessage }>(
        `/recruitment/${applicant.id}/messages`,
        { text: text.trim() || undefined, attachment: attachment || undefined }
      );
      setMessages((prev) => [...prev, res.message]);
      setText("");
      setAttachment(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl flex h-[520px] flex-col p-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Chat Rekrutmen
      </h2>

      {!enabled ? (
        <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          Chat hanya tersedia untuk pelamar yang sudah lolos berkas dan
          sedang/sudah menjalani tahap tes.
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-muted/50 p-3">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Belum ada percakapan. Mulai koordinasi jadwal tes keterampilan
                di sini.
              </p>
            )}
            {messages.map((m) => {
              const isMine = m.sender_role === "admin" && m.sender_id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground"
                    }`}
                  >
                    {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                    {m.attachment && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.attachment}
                        alt="Lampiran"
                        className="mt-1 max-h-48 rounded-xl object-cover"
                      />
                    )}
                    <p
                      className={`mt-1 text-[10px] ${
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(m.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {attachment && (
            <div className="mt-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachment} alt="preview" className="h-12 w-12 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-xs font-semibold text-destructive"
              >
                Hapus
              </button>
            </div>
          )}

          {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}

          <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
              📎
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <Button type="submit" disabled={sending || (!text.trim() && !attachment)}>
              {sending ? "Mengirim..." : "Kirim"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
