import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface BulkClassificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onComplete?: () => void;
}

export function BulkClassificationDialog({
  open,
  onOpenChange,
  selectedIds,
  onComplete
}: BulkClassificationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (open) {
      setIsProcessing(false);
      setError(null);
      setSuccessCount(0);
      setIsFinished(false);
    }
  }, [open]);

  const handleStart = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/classify/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackIds: selectedIds, provider: "mock" })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "Bulk classification failed");
      }

      setSuccessCount(data.data.count);
      setIsFinished(true);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-indigo-500" />
            Bulk AI Classification
          </DialogTitle>
          <DialogDescription>
            You are about to run AI classification on {selectedIds.length} selected feedback items.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isFinished ? (
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Classification Complete</h3>
              <p className="text-sm text-gray-500">
                Successfully classified {successCount} out of {selectedIds.length} items.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <div className="text-sm text-red-700">
                  <h3 className="font-medium text-red-800">Operation Failed</h3>
                  <div className="mt-1">{error}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
               <p className="text-sm text-slate-600 mb-4">
                 This process will analyze sentiment, extract themes, and categorize intent using the configured AI provider.
               </p>
               {isProcessing && (
                 <div className="flex items-center justify-center text-sm font-medium text-indigo-600">
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Processing {selectedIds.length} items...
                 </div>
               )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!isFinished ? (
             <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleStart} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
                {isProcessing ? "Processing..." : "Start Classification"}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
