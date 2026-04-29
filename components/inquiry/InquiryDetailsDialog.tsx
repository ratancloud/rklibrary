"use client";

import { ReactNode, useState } from "react";
import { format } from "date-fns";
import {
  User,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Check,
  Hash,
  Zap,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Inquiry } from "@/types/inqueriy";

const STATUS_MAP = {
  PENDING: {
    color: "bg-amber-500",
    light: "bg-amber-500/10",
    text: "text-amber-600",
  },
  CONTACTED: {
    color: "bg-blue-500",
    light: "bg-blue-500/10",
    text: "text-blue-600",
  },
  CONVERTED: {
    color: "bg-emerald-500",
    light: "bg-emerald-500/10",
    text: "text-emerald-600",
  },
  CANCELLED: {
    color: "bg-red-500",
    light: "bg-red-500/10",
    text: "text-red-600",
  },
};

interface InquiryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: Inquiry;
}

export default function InquiryDetailsDialog({
  open,
  onOpenChange,
  inquiry,
}: InquiryDetailsDialogProps) {
  const [copied, setCopied] = useState(false);
  const cfg =
    STATUS_MAP[inquiry.status as keyof typeof STATUS_MAP] || STATUS_MAP.PENDING;

  const copyId = () => {
    navigator.clipboard.writeText(inquiry.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-background">
        <div className={cn("p-6 flex items-center justify-between", cfg.light)}>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "size-12 rounded-2xl flex items-center justify-center shadow-sm",
                cfg.color,
              )}
            >
              <User className="text-white size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground leading-none mb-1.5">
                {inquiry.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "text-[10px] px-2 py-0 border-none font-bold",
                    cfg.color,
                    "text-white",
                  )}
                >
                  {inquiry.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Ref: {inquiry.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyId}
            className="rounded-xl size-9 bg-background border-border hover:bg-muted"
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Hash size={16} className="text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-11"
            >
              <a href={`tel:${inquiry.phoneNumber}`}>
                <Phone size={16} className="mr-2" /> Call Lead
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11 border-border bg-background hover:bg-muted"
            >
              <MessageSquare size={16} className="mr-2" /> WhatsApp
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailItem
              icon={<CalendarCheck size={14} />}
              label="Joining Date"
              value={
                inquiry.joiningDate
                  ? format(new Date(inquiry.joiningDate), "dd MMM")
                  : "TBD"
              }
            />
            <DetailItem
              icon={<Zap size={14} />}
              label="Gender"
              value={inquiry.gender}
            />
            <DetailItem
              icon={<Clock size={14} />}
              label="Recieved"
              value={format(new Date(inquiry.createdAt), "hh:mm a")}
            />
            <DetailItem
              icon={<ShieldCheck size={14} />}
              label="Lead Type"
              value="New Web Inquiry"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Preferred Shifts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {inquiry.shiftNames.map((s: string) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg bg-muted text-foreground text-[11px] font-bold border border-border"
                >
                  {s.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex gap-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin size={16} />
              </div>
              <p className="text-sm text-foreground leading-tight py-1">
                {inquiry.address || "No address provided"}
              </p>
            </div>

            {inquiry.message && (
              <div className="flex gap-3">
                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div className="bg-muted rounded-xl p-3 flex-1">
                  <p className="text-xs text-muted-foreground italic">
                    {inquiry.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/30 p-4 border-t border-border flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            Created {format(new Date(inquiry.createdAt), "PPP")}
          </p>
          <div className="flex gap-1">
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            <div className="size-1.5 rounded-full bg-border" />
            <div className="size-1.5 rounded-full bg-border" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-1">
          {label}
        </p>
        <p className="text-xs font-bold text-foreground leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
