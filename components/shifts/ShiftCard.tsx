import { Clock } from "lucide-react";
import { minutesToAmPm } from "@/lib/helper";

interface ShiftCardProps {
  name: string;
  startTime: number;
  endTime: number;
  price: number;
  color?: string;
}

export function ShiftCard({
  name,
  startTime,
  endTime,
  price,
  color = "from-blue-400 to-blue-600",
}: ShiftCardProps) {
  const colorMap: Record<string, string> = {
    MORNING: "from-orange-400 to-orange-600",
    AFTERNOON: "from-blue-400 to-blue-600",
    EVENING: "from-purple-400 to-purple-600",
    NIGHT: "from-green-400 to-green-600",
  };

  const displayColor = colorMap[name] || color;
  const displayName = name.charAt(0) + name.slice(1).toLowerCase();
  const formattedStartTime = minutesToAmPm(startTime);
  const formattedEndTime = minutesToAmPm(endTime);

  return (
    <div className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <Clock className={`size-8 mb-3 bg-linear-to-br ${displayColor} bg-clip-text text-transparent`} />
      <h3 className="font-bold text-gray-950 mb-2">{displayName}</h3>
      <p className="text-lg font-semibold text-primary mb-2">
        {formattedStartTime} - {formattedEndTime}
      </p>
      <p className="text-sm text-gray-600 mb-3">
        ₹{price.toFixed(2)}/month
      </p>
    </div>
  );
}
