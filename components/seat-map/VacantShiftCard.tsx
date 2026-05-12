import { cn } from "@/lib/utils";
import { formatShiftName } from "@/types/seatMapTypes";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function VacantShiftCard({
  shiftName,
  isInactive,
  seatId,
  seatNo,
  floorName,
}: {
  shiftName: string;
  isInactive: boolean;
  seatId: string;
  seatNo: string;
  floorName: string;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "rounded-xl border p-3 flex items-center justify-between gap-3",
        isInactive
          ? "bg-muted/20 border-border/30 opacity-50"
          : "bg-muted/10 border-border/40",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span className="text-sm font-medium text-foreground">
          {formatShiftName(shiftName)}
        </span>
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          {isInactive ? "Inactive" : "Vacant"}
        </Badge>
      </div>
      {!isInactive && (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-7 text-xs shrink-0">
            Add
          </Button>

          <Button
            size="sm"
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            onClick={() =>
              router.push(
                `/booking?seatId=${seatId}&seatNo=${seatNo}&floorName=${encodeURIComponent(floorName)}`,
              )
            }
          >
            Book
          </Button>
        </div>
      )}
    </div>
  );
}
