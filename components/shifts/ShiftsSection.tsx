"use client";

import { useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { minutesToAmPm } from "@/lib/helper";
import { useShiftStore } from "@/store/useShiftStore";

interface ShiftsSectionProps {
  title?: string;
  subtitle?: string;
  variant?: "home" | "about";
}

export function ShiftsSection({
  title = "Our Shift Timings",
  subtitle = "Choose the shift that works best for your study schedule.",
  variant = "home",
}: ShiftsSectionProps) {
  const { shifts, isLoading, error, fetchShifts } = useShiftStore();

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const isHome = variant === "home";
  const activeShifts = shifts.filter(s => s.isActive);

  const getShiftColor = (name: string) => {
    const colors: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
      MORNING: {
        bg: "from-orange-50 to-orange-100/50",
        border: "border-orange-200/60",
        badge: "bg-orange-100 text-orange-700",
        icon: "bg-orange-400"
      },
      AFTERNOON: {
        bg: "from-blue-50 to-blue-100/50",
        border: "border-blue-200/60",
        badge: "bg-blue-100 text-blue-700",
        icon: "bg-blue-400"
      },
      EVENING: {
        bg: "from-purple-50 to-purple-100/50",
        border: "border-purple-200/60",
        badge: "bg-purple-100 text-purple-700",
        icon: "bg-purple-400"
      },
      NIGHT: {
        bg: "from-indigo-50 to-indigo-100/50",
        border: "border-indigo-200/60",
        badge: "bg-indigo-100 text-indigo-700",
        icon: "bg-indigo-400"
      }
    };
    return colors[name] || colors.AFTERNOON;
  };

  const formatShiftName = (name: string) => {
    return name.charAt(0) + name.slice(1).toLowerCase();
  };

  return (
    <section id="shifts" className={`py-24 px-6 ${isHome ? "bg-linear-to-b from-slate-50 to-white" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
            <Clock size={16} />
            Flexible Timings
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight mb-4 text-balance">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle2 size={18} className="text-green-600" />
            <span><strong>{activeShifts.length}</strong> Active Shift{activeShifts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-64 rounded-3xl bg-linear-to-br from-gray-200 to-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-900 p-8 rounded-3xl text-center border-2 border-red-200 max-w-md mx-auto">
            <AlertCircle className="mx-auto mb-3" size={32} />
            <p className="font-semibold">{error}</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-900 p-8 rounded-3xl text-center border-2 border-yellow-200 max-w-md mx-auto">
            <AlertCircle className="mx-auto mb-3" size={32} />
            <p className="font-semibold">No shifts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shifts.map((shift) => {
              const colors = getShiftColor(shift.name);
              const startTime = minutesToAmPm(shift.startTime);
              const endTime = minutesToAmPm(shift.endTime);

              return (
                <div
                  key={shift.id}
                  className={`group relative overflow-hidden rounded-3xl border-2 ${colors.border} ${
                    shift.isActive ? `bg-linear-to-br ${colors.bg}` : "bg-linear-to-br from-gray-50 to-gray-100"
                  } p-6 transition-all duration-300 ${
                    shift.isActive
                      ? "hover:shadow-lg hover:-translate-y-1 hover:border-opacity-100"
                      : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl ${
                      shift.isActive ? colors.icon : "bg-gray-400"
                    }`}
                  />

                  <div className="absolute top-4 right-4 flex items-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        shift.isActive
                          ? colors.badge
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {shift.isActive ? (
                        <>
                          <CheckCircle2 size={12} />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colors.badge} mb-4 transition-transform group-hover:scale-110`}
                    >
                      <Clock size={24} />
                    </div>

                    <h3 className={`text-xl font-bold mb-3 ${shift.isActive ? "text-gray-950" : "text-gray-600"}`}>
                      {formatShiftName(shift.name)}
                    </h3>

                    <div className={`mb-4 pb-4 border-b-2 ${shift.isActive ? "border-current/10" : "border-gray-300"}`}>
                      <p className={`text-sm font-semibold ${shift.isActive ? "text-gray-700" : "text-gray-500"}`}>
                        Time
                      </p>
                      <p className={`text-lg font-bold ${shift.isActive ? "text-gray-950" : "text-gray-600"}`}>
                        {startTime} - {endTime}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className={`text-sm font-semibold mb-1 ${shift.isActive ? "text-gray-700" : "text-gray-500"}`}>
                        Monthly Price
                      </p>
                      <p className={`text-2xl font-extrabold ${shift.isActive ? "text-primary" : "text-gray-400"}`}>
                        ₹{shift.price.toFixed(0)}
                      </p>
                    </div>

                    {!shift.isActive && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                        <p className="text-xs text-gray-600 font-medium">
                          Currently unavailable for booking
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
