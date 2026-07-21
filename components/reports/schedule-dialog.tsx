"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ScheduleDialogProps {
  templateId: string;
  onClose: () => void;
}

export function ScheduleDialog({ templateId, onClose }: ScheduleDialogProps) {
  const [cron, setCron] = useState<string>("0 0 * * 1"); // Default: Every Monday at midnight
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: "Scheduled Weekly Report",
          templateId,
          dateRange: {
            start: new Date().toISOString(), // Mock, real impl would use rolling dates
            end: new Date().toISOString()
          },
          schedule: {
            cron,
            timezone: "UTC"
          }
        })
      });
      
      if (response.ok) {
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogDescription>
            Configure recurring generation for this intelligence template.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Cron Expression</label>
            <Input 
              value={cron} 
              onChange={(e) => setCron(e.target.value)} 
              placeholder="0 0 * * 1"
            />
            <p className="text-xs text-muted-foreground">Standard 5-part cron syntax (UTC)</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={isLoading || !cron}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
