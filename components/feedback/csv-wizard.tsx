"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, AlertTriangle, CheckCircle, Download } from "lucide-react";
import type { ImportSummary } from "@/services/import.service";

interface CsvWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function CsvWizard({ isOpen, onClose, onImportComplete }: CsvWizardProps) {
  const [step, setStep] = useState<"upload" | "map" | "validate" | "summary">("upload");
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    title: "",
    body: "",
    channel: "",
    externalId: "",
    customerName: "",
    customerEmail: "",
    sourceUrl: "",
    language: "",
    priority: "",
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const resetWizard = () => {
    setStep("upload");
    setCsvText("");
    setHeaders([]);
    setSampleRows([]);
    setMapping({
      title: "",
      body: "",
      channel: "",
      externalId: "",
      customerName: "",
      customerEmail: "",
      sourceUrl: "",
      language: "",
      priority: "",
    });
    setSummary(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);

      const rows = text
        .split(/\r?\n/)
        .map((row) => row.split(",").map((cell) => cell.replace(/^"(.*)"$/, "$1").trim()))
        .filter((row) => row.length > 0 && row.some((c) => c !== ""));

      if (rows.length === 0) {
        toast.error("CSV file is empty.");
        return;
      }

      const fileHeaders = rows[0] || [];
      setHeaders(fileHeaders);
      setSampleRows(rows.slice(1, 4)); // preview first 3 rows

      // Try automatic mapping based on match names
      const newMapping = { ...mapping };
      const fields = ["title", "body", "channel", "externalId", "customerName", "customerEmail", "sourceUrl", "language", "priority"];
      
      fields.forEach((field) => {
        const matched = fileHeaders.find(
          (h) =>
            h.toLowerCase() === field.toLowerCase() ||
            h.toLowerCase().replace(/[^a-z0-9]/g, "") === field.toLowerCase().replace(/[^a-z0-9]/g, "")
        );
        if (matched) {
          newMapping[field] = matched;
        }
      });
      setMapping(newMapping);
      setStep("map");
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!mapping.title || !mapping.body || !mapping.channel) {
      toast.error("Please map all required columns (Title, Body, Channel).");
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/feedback/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvText,
          columnMapping: mapping,
          execute: false,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to validate CSV data.");
      }

      setSummary(json.data.summary);
      setStep("validate");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Validation failed.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const res = await fetch("/api/feedback/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvText,
          columnMapping: mapping,
          execute: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to import CSV data.");
      }

      setSummary(json.data.summary);
      setStep("summary");
      toast.success("Import completed successfully!");
      onImportComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadErrorLog = () => {
    if (!summary?.errors || summary.errors.length === 0) return;

    const csvContent = [
      "Row,Column,Error Message",
      ...summary.errors.map((e) => `${e.row},"${e.column || ""}","${e.message.replace(/"/g, '""')}"`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `import_errors_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border shadow-2xl rounded-2xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">CSV Import Wizard</h2>
            <p className="text-xs text-muted-foreground">Import customer feedback logs from a CSV file (maximum 5,000 rows).</p>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl bg-card/40 hover:bg-card/60 transition duration-200">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Drag and drop your CSV file here</p>
            <p className="text-xs text-muted-foreground mb-4">or click the button below to browse</p>
            <input
              type="file"
              id="csv-file-input"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            <Button asChild variant="outline">
              <label htmlFor="csv-file-input" className="cursor-pointer">
                Select CSV File
              </label>
            </Button>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === "map" && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="text-xs font-semibold text-foreground/90 border-b pb-2 mb-2">
              Map CSV Headers to Database Fields
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Title *", field: "title", required: true },
                { label: "Feedback Body *", field: "body", required: true },
                { label: "Channel *", field: "channel", required: true },
                { label: "External ID", field: "externalId" },
                { label: "Customer Name", field: "customerName" },
                { label: "Customer Email", field: "customerEmail" },
                { label: "Source Reference URL", field: "sourceUrl" },
                { label: "Priority (Integer)", field: "priority" },
              ].map((item) => (
                <div key={item.field} className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {item.label}
                  </Label>
                  <select
                    value={mapping[item.field] || ""}
                    onChange={(e) => setMapping({ ...mapping, [item.field]: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{item.required ? "Select Column..." : "None"}</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            {sampleRows.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">CSV Raw Data Preview:</div>
                <div className="overflow-x-auto border border-border/80 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/80">
                        {headers.map((h, i) => (
                          <th key={i} className="p-2 font-medium border-b border-border/60">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleRows.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/20 border-b border-border/40">
                          {row.map((cell, j) => (
                            <td key={j} className="p-2 border-b border-border/40 truncate max-w-[150px]">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Validate */}
        {step === "validate" && summary && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="text-xs font-semibold border-b pb-2 mb-2">CSV Pre-Import Verification Summary</div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-xl bg-primary/5 border-primary/20">
                <div className="text-2xl font-bold text-primary">{summary.importedCount}</div>
                <div className="text-xs text-muted-foreground font-semibold">Valid Rows Ready</div>
              </div>
              <div className="p-4 border rounded-xl bg-yellow-500/5 border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.skippedCount}</div>
                <div className="text-xs text-muted-foreground font-semibold">Duplicates (Will Skip)</div>
              </div>
              <div className="p-4 border rounded-xl bg-destructive/5 border-destructive/20">
                <div className="text-2xl font-bold text-destructive">{summary.failedCount}</div>
                <div className="text-xs text-muted-foreground font-semibold">Validation Failures</div>
              </div>
            </div>

            {summary.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Detected {summary.errors.length} parsing/validation warnings
                  </div>
                  <Button variant="ghost" size="sm" onClick={downloadErrorLog} className="h-7 text-xs flex items-center gap-1">
                    <Download className="h-3 w-3" /> Download Error Log
                  </Button>
                </div>
                <div className="max-h-[160px] overflow-y-auto border rounded-lg bg-card/60 p-2 text-xs space-y-1">
                  {summary.errors.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-1 last:border-0 border-border/40">
                      <span>Row {err.row} ({err.column}): <span className="text-muted-foreground">{err.message}</span></span>
                    </div>
                  ))}
                  {summary.errors.length > 10 && (
                    <div className="text-center text-muted-foreground font-semibold py-1">
                      ...and {summary.errors.length - 10} more rows. Download the log to view all errors.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Summary */}
        {step === "summary" && summary && (
          <div className="text-center py-6 space-y-4 flex-1">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold">Import Complete</h3>
            <p className="text-sm text-muted-foreground">
              Successfully processed and stored the imported customer logs into your workspace database.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto border rounded-xl p-4 bg-muted/40 text-sm">
              <div className="text-left font-semibold text-muted-foreground">Rows Imported:</div>
              <div className="text-right font-bold text-primary">{summary.importedCount}</div>
              
              <div className="text-left font-semibold text-muted-foreground">Rows Skipped (Duplicates):</div>
              <div className="text-right font-bold">{summary.skippedCount}</div>

              <div className="text-left font-semibold text-muted-foreground">Rows Failed:</div>
              <div className="text-right font-bold text-destructive">{summary.failedCount}</div>
            </div>
          </div>
        )}

        <div className="mt-4 border-t pt-4 flex justify-end gap-2">
          {step === "upload" && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step === "map" && (
            <>
              <Button variant="ghost" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleValidate} disabled={isValidating}>
                {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify File
              </Button>
            </>
          )}

          {step === "validate" && (
            <>
              <Button variant="ghost" onClick={() => setStep("map")} disabled={isImporting}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !summary || summary.importedCount === 0}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Import
              </Button>
            </>
          )}

          {step === "summary" && (
            <Button onClick={() => { onClose(); resetWizard(); }} className="w-full">
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
