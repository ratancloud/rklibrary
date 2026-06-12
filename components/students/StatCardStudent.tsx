import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export default function StatCardStudent({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-linear-to-br from-background to-muted/20 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/10">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/5 transition-all duration-300" />

      <div className="relative flex items-center gap-2 md:gap-3 p-2.5 md:p-3">
        {/* Icon background */}
        <div
          className={cn(
            "p-1.5 md:p-2 rounded-md text-white shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md",
            `bg-linear-to-br ${color}`,
          )}
        >
          <Icon className="size-3 md:size-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-tight leading-tight">
            {label}
          </p>
          <p className="text-base md:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}