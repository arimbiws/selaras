"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, ExternalLink, Loader2, Send, Sparkles, X } from "lucide-react";

type Citation = { label: string; url: string };

type Message = {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
};

type ChatReply = {
  answer: string;
  region: string;
  tahun: number;
  citations: Citation[];
  error?: string;
};

const initialMessage: Message = {
  role: "assistant",
  text: "Halo. Saya dapat membantu membaca pagu, porsi bidang, peringkat, dan median dari data SELARAS. Sebutkan kabupaten/kota jika ingin bertanya tentang daerah tertentu.",
};

const quickPrompts = [
  "Ringkas anggaran daerah ini",
  "Bidang apa yang porsinya tertinggi?",
  "Bandingkan dengan median nasional",
  "Data tahun apa yang tersedia?",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const node = threadRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [loading, messages, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    setMessages((items) => [...items, { role: "user", text: question }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const payload = (await response.json()) as ChatReply;
      if (!response.ok) {
        throw new Error(payload.error ?? "Asisten belum dapat menjawab.");
      }
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: payload.answer,
          citations: payload.citations,
        },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Asisten belum dapat menjawab.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className={`ai${open ? " ai-open" : ""}`}>
      {open ? (
        <div className="ai-panel" role="dialog" aria-label="Asisten data SELARAS">
          <div className="ai-head">
            <span className="ai-mark">
              <Sparkles size={17} aria-hidden="true" />
            </span>
            <div>
              <b>Asisten SELARAS</b>
              <span>Jawaban dari data anggaran yang tersedia</span>
            </div>
            <button
              type="button"
              className="ai-close"
              onClick={() => setOpen(false)}
              aria-label="Tutup asisten"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="ai-thread" ref={threadRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={`ai-msg ${message.role}`} key={`${message.role}-${index}`}>
                <span className="ai-avatar" aria-hidden="true">
                  {message.role === "assistant" ? <Bot size={14} /> : "Anda"}
                </span>
                <div className="ai-bubble">
                  <span>{message.text}</span>
                  {message.citations?.length ? (
                    <div className="ai-citations">
                      {message.citations.map((citation) => (
                        <a
                          href={citation.url}
                          key={citation.label}
                          target={citation.url.startsWith("http") ? "_blank" : undefined}
                          rel={citation.url.startsWith("http") ? "noreferrer" : undefined}
                        >
                          {citation.label}
                          {citation.url.startsWith("http") ? (
                            <ExternalLink size={11} aria-hidden="true" />
                          ) : null}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="ai-msg assistant">
                <span className="ai-avatar" aria-hidden="true">
                  <Bot size={14} />
                </span>
                <div className="ai-bubble ai-thinking">
                  <Loader2 size={14} className="spin" aria-hidden="true" />
                  <span>Menyusun jawaban dari data…</span>
                </div>
              </div>
            ) : null}

            {error ? <div className="ai-error">{error}</div> : null}
          </div>

          {messages.length <= 1 ? (
            <div className="ai-prompts">
              {quickPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => void send(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form className="ai-form" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tanya tentang anggaran daerah…"
              aria-label="Pertanyaan untuk asisten"
              maxLength={500}
            />
            <button type="submit" disabled={loading || input.trim().length < 3}>
              <Send size={15} aria-hidden="true" />
              <span className="sr-only">Kirim pertanyaan</span>
            </button>
          </form>
          <span className="ai-note">
            Jawaban bersifat indikatif dan disusun dari pagu DJPK. Bukan penilaian kualitas layanan.
          </span>
        </div>
      ) : null}

      <button
        type="button"
        className="ai-fab"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Tutup asisten data" : "Buka asisten data"}
      >
        {open ? <X size={19} aria-hidden="true" /> : <Sparkles size={19} aria-hidden="true" />}
        <span>Tanya data</span>
      </button>
    </div>
  );
}
