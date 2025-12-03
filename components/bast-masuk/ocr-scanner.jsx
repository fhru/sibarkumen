"use client";

import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Scan,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { parseOcrText, formatParseResult } from "@/lib/ocr-parser";
import { toast } from "sonner";

export function OcrScanner({ barangOptions = [], onDataExtracted }) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState(null);
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll)");
      return;
    }

    // Validasi ukuran (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    // Preview gambar
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setResult(null);
      setRawText("");
    };
    reader.readAsDataURL(file);
  };

  const processOcr = async () => {
    if (!imagePreview) {
      toast.error("Pilih gambar terlebih dahulu");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressText("Mempersiapkan...");

    try {
      // Buat worker Tesseract
      const worker = await createWorker("ind+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setProgressText("Mengenali teks...");
          } else if (m.status === "loading language traineddata") {
            setProgressText("Memuat bahasa...");
          } else if (m.status === "initializing api") {
            setProgressText("Inisialisasi...");
          }
        },
      });

      setProgressText("Memproses gambar...");

      // Jalankan OCR
      const {
        data: { text },
      } = await worker.recognize(imagePreview);

      setRawText(text);

      // Parse hasil OCR
      const parsed = parseOcrText(text, barangOptions);
      const formatted = formatParseResult(parsed);

      setResult({
        parsed,
        formatted,
      });

      // Terminate worker
      await worker.terminate();

      setProgressText("Selesai!");
      toast.success("OCR berhasil diproses");
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Gagal memproses gambar");
    } finally {
      setIsProcessing(false);
    }
  };

  const applyToForm = () => {
    if (!result?.parsed) return;

    onDataExtracted(result.parsed);
    setOpen(false);
    toast.success("Data berhasil dimasukkan ke form");

    // Reset state
    setImagePreview(null);
    setResult(null);
    setRawText("");
  };

  const resetScanner = () => {
    setImagePreview(null);
    setResult(null);
    setRawText("");
    setProgress(0);
    setProgressText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Scan className="h-4 w-4" />
          Scan Dokumen (OCR)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Dokumen BAST</DialogTitle>
          <DialogDescription>
            Upload gambar/scan dokumen BAST untuk mengekstrak data secara
            otomatis
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-[300px] object-contain rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={resetScanner}
                      >
                        Ganti
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-[200px] cursor-pointer hover:bg-muted/50 rounded-lg border-2 border-dashed transition-colors">
                      <FileImage className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Klik untuk upload gambar
                      </span>
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG (Maks 10MB)
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mt-4 space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      {progressText} {progress > 0 && `(${progress}%)`}
                    </p>
                  </div>
                )}

                {/* Process Button */}
                {imagePreview && !isProcessing && !result && (
                  <Button
                    type="button"
                    className="w-full mt-4"
                    onClick={processOcr}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Proses OCR
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Result Preview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Hasil Ekstraksi
                  {result && (
                    <Badge
                      variant={
                        result.formatted.overallConfidence > 50
                          ? "default"
                          : "secondary"
                      }
                    >
                      {result.formatted.overallConfidence}% confidence
                    </Badge>
                  )}
                </h4>

                {!result ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">Belum ada hasil</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {/* Header Data */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground">
                          Nomor BAST:
                        </span>
                        <span className="font-medium break-all">
                          {result.formatted.header.nomorBast}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground">
                          Tanggal BAST:
                        </span>
                        <span className="font-medium">
                          {result.formatted.header.tanggalBast}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground">
                          Nomor BAPB:
                        </span>
                        <span className="font-medium break-all">
                          {result.formatted.header.nomorBapb}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground">
                          Tanggal BAPB:
                        </span>
                        <span className="font-medium">
                          {result.formatted.header.tanggalBapb}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span className="font-medium">
                          {result.formatted.header.pihakKetiga}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    {result.formatted.items.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="font-medium mb-2">
                          Barang ({result.formatted.items.length} item):
                        </p>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                          {result.formatted.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded"
                            >
                              {item.matched ? (
                                <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-yellow-500 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{item.namaBarang}</p>
                                <p className="text-muted-foreground">
                                  {item.jumlah} x Rp{" "}
                                  {item.hargaSatuan.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Raw Text (Collapsible) */}
          {rawText && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Lihat teks mentah hasil OCR
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded-lg text-xs whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                {rawText}
              </pre>
            </details>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button type="button" disabled={!result} onClick={applyToForm}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Terapkan ke Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
