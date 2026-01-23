"use client";

import * as React from "react";
import { Loader2, MessageSquare, Send, Sparkle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export interface ChatAssistantPanelProps {
  title?: string;
  initialOpen?: boolean;
  initialMessages?: ChatMessage[];
  onSend?: (
    message: string,
    context: ChatMessage[],
  ) => AsyncIterable<string> | Promise<AsyncIterable<string>>;
  apiEndpoint?: string;
  className?: string;
  panelClassName?: string;
  footerHint?: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function renderInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    const boldMatch = rest.match(/\*\*(.+?)\*\*/);
    const codeMatch = rest.match(/`(.+?)`/);
    const nextMatch =
      !boldMatch && !codeMatch
        ? null
        : !boldMatch
          ? codeMatch
          : !codeMatch
            ? boldMatch
            : boldMatch.index! < codeMatch.index!
              ? boldMatch
              : codeMatch;

    if (!nextMatch || nextMatch.index === undefined) {
      parts.push(rest);
      break;
    }

    if (nextMatch.index > 0) {
      parts.push(rest.slice(0, nextMatch.index));
    }

    const token = nextMatch[0];
    const content = nextMatch[1];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold">
          {content}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={`c-${key++}`}
          className="rounded bg-background/70 px-1 py-0.5 text-[0.85em]"
        >
          {content}
        </code>,
      );
    }

    rest = rest.slice(nextMatch.index + token.length);
  }

  return parts;
}

function renderMarkdown(text: string) {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+\.\s+/);
    const unorderedMatch = line.match(/^\s*[-*]\s+/);

    if (orderedMatch || unorderedMatch) {
      const isOrdered = !!orderedMatch;
      const items: React.ReactNode[] = [];

      while (i < lines.length) {
        const current = lines[i];
        const isItem =
          (isOrdered && /^\s*\d+\.\s+/.test(current)) ||
          (!isOrdered && /^\s*[-*]\s+/.test(current));
        if (!isItem) break;

        const content = current.replace(/^\s*([-*]|\d+\.)\s+/, "");
        items.push(
          <li key={`li-${key++}`} className="leading-relaxed">
            {renderInlineMarkdown(content)}
          </li>,
        );
        i += 1;
      }

      blocks.push(
        isOrdered ? (
          <ol key={`ol-${key++}`} className="list-decimal space-y-1 pl-4">
            {items}
          </ol>
        ) : (
          <ul key={`ul-${key++}`} className="list-disc space-y-1 pl-4">
            {items}
          </ul>
        ),
      );
      continue;
    }

    blocks.push(
      <p key={`p-${key++}`} className="leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>,
    );
    i += 1;
  }

  return blocks;
}

export function ChatAssistantPanel({
  title = "Sibarkumen AI Assistant",
  initialOpen = false,
  initialMessages = [],
  onSend,
  apiEndpoint = "/api/chat",
  className,
  panelClassName,
  footerHint = "Enter untuk kirim, Shift+Enter untuk baris baru",
}: ChatAssistantPanelProps) {
  const [open, setOpen] = React.useState(initialOpen);
  const [messages, setMessages] =
    React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingId, setStreamingId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, isStreaming]);

  const appendToMessage = React.useCallback((id: string, chunk: string) => {
    if (!chunk) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + chunk } : msg,
      ),
    );
  }, []);

  const defaultOnSend = React.useCallback(
    async function* (message: string, context: ChatMessage[]) {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: context.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Chat request failed");
      }
      if (!response.body) {
        throw new Error("Chat response stream unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") return;

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              yield delta;
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }
    },
    [apiEndpoint],
  );

  const handleSend = React.useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: text,
    };
    const assistantMessage: ChatMessage = {
      id: makeId(),
      role: "assistant",
      content: "",
    };

    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingId(assistantMessage.id);

    try {
      setErrorMessage(null);
      const stream = await (onSend
        ? onSend(text, nextMessages)
        : defaultOnSend(text, nextMessages));
      for await (const chunk of stream) {
        appendToMessage(assistantMessage.id, chunk);
      }
    } catch (error) {
      appendToMessage(
        assistantMessage.id,
        "Terjadi kendala saat memproses jawaban.",
      );
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Tidak dapat menghubungi layanan AI.",
      );
    } finally {
      setIsStreaming(false);
      setStreamingId(null);
    }
  }, [appendToMessage, defaultOnSend, input, isStreaming, messages, onSend]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3",
        className,
      )}
    >
      {open && (
        <div
          className={cn(
            "w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200",
            panelClassName,
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">
                  Siap membantu pengelolaan dokumen
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Tutup panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[360px] px-2.5 py-2">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="rounded-lg border border-dashed bg-muted/30 p-2.5 text-sm text-muted-foreground">
                  Tanyakan apa pun seputar SPB, SPPB, BAST, atau alur dokumen
                  lainnya.
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cara membuat SPB baru?",
                    "Apa perbedaan SPB dan SPPB?",
                    "Bagaimana proses BAST keluar?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="rounded-lg border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-2.5 py-2 text-sm leading-relaxed",
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {message.content ? (
                        <div className="space-y-2">
                          {renderMarkdown(message.content)}
                        </div>
                      ) : streamingId === message.id ? (
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Mengetik...
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Belum ada jawaban. Coba ulangi pertanyaan.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="border-t px-3 py-2">
            {errorMessage && (
              <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                {errorMessage}
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tulis pesan..."
                className="min-h-[40px] resize-none"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                type="button"
                className="h-10 w-10 shrink-0 rounded-lg"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                aria-label="Kirim pesan"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              {footerHint}
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        className="h-12 w-12 rounded-full shadow-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
        onClick={() => setOpen((value) => !value)}
        aria-label="Buka chat assistant"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  );
}
