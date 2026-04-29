"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  User2,
  Loader2,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING: {
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Clock,
  },
  CONTACTED: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Phone,
  },
  CONVERTED: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  CANCELLED: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: XCircle,
  },
};

interface InquiryStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: { id: string; name: string; phoneNumber: string; status: string };
  onStatusChange: (newStatus: string) => Promise<void>;
}

export default function InquiryStatusDialog({
  open,
  onOpenChange,
  inquiry,
  onStatusChange,
}: InquiryStatusDialogProps) {
  const [newStatus, setNewStatus] = useState(inquiry.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => setNewStatus(inquiry.status), [inquiry.status, open]);

  const handleSave = async () => {
    if (newStatus === inquiry.status) return onOpenChange(false);
    setLoading(true);
    try {
      await onStatusChange(newStatus);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-border shadow-2xl bg-background">
        <div
          className={cn(
            "h-1.5 w-full transition-colors duration-500",
            activeConfig.bg.replace("/10", ""),
          )}
        />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", activeConfig.bg)}>
                <activeConfig.icon
                  className={cn("size-5", activeConfig.color)}
                />
              </div>
              <DialogTitle className="text-xl text-foreground">
                Inquiry Lifecycle
              </DialogTitle>
            </div>
            <DialogDescription className="text-balance text-muted-foreground">
              Update{" "}
              <span className="font-semibold text-foreground">
                {inquiry.name}
              </span>
              &apos;s journey from lead to library member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User2 size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Basic Info
                  </span>
                </div>
                <p className="text-sm text-foreground truncate">
                  {inquiry.name}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Phone size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Contact
                  </span>
                </div>
                <p className="text-sm text-foreground">{inquiry.phoneNumber}</p>
              </div>
            </div>

            <div className="relative flex justify-between px-2">
              <div className="absolute top-4 left-0 w-full h-0.5 bg-border -z-10" />
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const isSelected = newStatus === key;
                return (
                  <div key={key} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                        isSelected
                          ? `${cfg.color} ${cfg.border} scale-110 shadow-lg`
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <cfg.icon size={14} />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        isSelected ? cfg.color : "text-muted-foreground",
                      )}
                    >
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                <ChevronRight size={14} className="text-primary" /> Action:
                Transition lead to
              </label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
                disabled={loading}
              >
                <SelectTrigger className="w-full bg-background h-12 rounded-xl shadow-sm border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="focus:bg-muted py-3"
                    >
                      <div className="flex items-center gap-2">
                        <cfg.icon size={16} className={cfg.color} />
                        <span className="font-medium text-foreground">
                          {key}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === "CONVERTED" && (
              <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-in fade-in slide-in-from-top-1">
                <Info size={18} className="shrink-0" />
                <p className="text-xs leading-relaxed">
                  Moving to <span className="font-bold">Converted</span> will
                  signify this student has officially joined. Ensure payment is
                  verified.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-6 flex flex-row items-center justify-end gap-3 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="hover:bg-muted text-muted-foreground rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || newStatus === inquiry.status}
            className={cn(
              "min-w-35 rounded-xl font-bold shadow-lg transition-all active:scale-95",
              newStatus !== inquiry.status
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground border border-border",
            )}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="size-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
