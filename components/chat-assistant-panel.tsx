"use client";

import * as React from "react";
import { Bot, Loader2, MessageSquare, Send, Sparkle, X } from "lucide-react";
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
  className?: string;
  panelClassName?: string;
  footerHint?: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatAssistantPanel({
  title = "AI Assistant",
  initialOpen = false,
  initialMessages = [],
  onSend,
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
      if (!onSend) {
        appendToMessage(
          assistantMessage.id,
          "Fitur chat belum terhubung ke server.",
        );
        return;
      }

      const stream = await onSend(text, nextMessages);
      for await (const chunk of stream) {
        appendToMessage(assistantMessage.id, chunk);
      }
    } catch (error) {
      appendToMessage(
        assistantMessage.id,
        "Terjadi kendala saat memproses jawaban.",
      );
    } finally {
      setIsStreaming(false);
      setStreamingId(null);
    }
  }, [appendToMessage, input, isStreaming, messages, onSend]);

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
                      {message.content ||
                        (streamingId === message.id ? (
                          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Mengetik...
                          </span>
                        ) : (
                          "-"
                        ))}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="border-t px-3 py-2">
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
