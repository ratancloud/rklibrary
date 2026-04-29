import {
  Controller,
  Control,
  UseFormRegister,
  FieldErrors,
  FieldArrayWithId,
} from "react-hook-form";
import { minutesToAmPm, minutesToTime, timeToMinutes } from "@/lib/helper";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { ShiftFormValues } from "./ShiftDetails";

interface ShiftCardProps {
  index: number;
  field: FieldArrayWithId<ShiftFormValues, "shifts", "id">;
  currentShift: Partial<ShiftFormValues["shifts"][number]>;
  isEditing: boolean;
  isLoading: boolean;
  control: Control<ShiftFormValues>;
  register: UseFormRegister<ShiftFormValues>;
  errors: FieldErrors<ShiftFormValues>;
}

export const ShiftCard = ({
  index,
  field,
  currentShift,
  isEditing,
  isLoading,
  control,
  register,
  errors,
}: ShiftCardProps) => {
  const isActive = currentShift?.isActive ?? field.isActive ?? false;
  const shiftName = field.name.replace("_", " ");

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isActive
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-border bg-muted/50 opacity-70"
      }`}
    >
      {/* HEADER: BADGE & TOGGLE */}
      <div className="flex justify-between items-center mb-6">
        <span
          className={`text-[10px] font-black px-2.5 py-1.5 rounded bg-background border uppercase tracking-widest ${
            isActive
              ? "text-primary border-primary/30 shadow-sm"
              : "text-muted-foreground border-border"
          }`}
        >
          {shiftName}
        </span>

        {isEditing ? (
          <label className="cursor-pointer group flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
            <input
              {...register(`shifts.${index}.isActive`)}
              type="checkbox"
              className="hidden"
              disabled={isLoading}
            />
            <div
              className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/60"}`}
            >
              {isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </div>
          </label>
        ) : (
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-primary" : "text-muted-foreground"}`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* START TIME */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Start Time
          </label>
          {isEditing ? (
            <>
              <Controller
                control={control}
                name={`shifts.${index}.startTime`}
                render={({ field }) => (
                  <input
                    type="time"
                    value={minutesToTime(Number(field.value) || 0)}
                    onChange={(e) =>
                      field.onChange(timeToMinutes(e.target.value))
                    }
                    disabled={isLoading}
                    className={`w-full mt-1.5 px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium transition-all ${
                      errors.shifts?.[index]?.startTime
                        ? "border-destructive ring-2 ring-destructive/20"
                        : "border-border"
                    }`}
                  />
                )}
              />
              {errors.shifts?.[index]?.startTime && (
                <p className="text-destructive text-xs mt-1">
                  {errors.shifts[index]?.startTime?.message}
                </p>
              )}
            </>
          ) : (
            <p
              className={`font-semibold mt-1 text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}
            >
              {minutesToAmPm(
                Number(currentShift?.startTime ?? field.startTime),
              )}
            </p>
          )}
        </div>

        {/* END TIME */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            End Time
          </label>
          {isEditing ? (
            <>
              <Controller
                control={control}
                name={`shifts.${index}.endTime`}
                render={({ field }) => (
                  <input
                    type="time"
                    value={minutesToTime(Number(field.value) || 0)}
                    onChange={(e) =>
                      field.onChange(timeToMinutes(e.target.value))
                    }
                    disabled={isLoading}
                    className={`w-full mt-1.5 px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium transition-all ${
                      errors.shifts?.[index]?.endTime
                        ? "border-destructive ring-2 ring-destructive/20"
                        : "border-border"
                    }`}
                  />
                )}
              />
              {errors.shifts?.[index]?.endTime && (
                <p className="text-destructive text-xs mt-1">
                  {errors.shifts[index]?.endTime?.message}
                </p>
              )}
            </>
          ) : (
            <p
              className={`font-semibold mt-1 text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}
            >
              {minutesToAmPm(Number(currentShift?.endTime ?? field.endTime))}
            </p>
          )}
        </div>

        {/* MONTHLY PRICE */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Monthly Price
          </label>
          {isEditing ? (
            <>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-sm">
                  ₹
                </span>
                <input
                  {...register(`shifts.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  disabled={isLoading}
                  placeholder="0"
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full pl-7 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-bold transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    errors.shifts?.[index]?.price
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-border"
                  }`}
                />
              </div>
              {errors.shifts?.[index]?.price && (
                <p className="text-destructive text-xs mt-1">
                  {errors.shifts[index]?.price?.message}
                </p>
              )}
            </>
          ) : (
            <p
              className={`font-bold mt-1 text-sm ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              ₹ {currentShift?.price ?? field.price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
