"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Layers,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useLibraryStore } from "@/store/useLibraryStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LibrarySetupPayload, librarySetupSchema } from "@/lib/validations";
import { minutesToTime, timeToMinutes } from "@/lib/helper";

const initialShiftsForm = [
  {
    name: "MORNING" as const,
    startTime: 420,
    endTime: 720,
    price: 500,
    isActive: true,
  },
  {
    name: "AFTERNOON" as const,
    startTime: 720,
    endTime: 1020,
    price: 500,
    isActive: true,
  },
  {
    name: "EVENING" as const,
    startTime: 1020,
    endTime: 1320,
    price: 500,
    isActive: true,
  },
  {
    name: "NIGHT" as const,
    startTime: 1320,
    endTime: 420,
    price: 1500,
    isActive: false,
  },
];

export const LibrarySetupForm = () => {
  const router = useRouter();
  const { setupLibrary } = useLibraryStore();

  const [currentStep, setCurrentStep] = useState<"library" | "infrastructure">(
    "library",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [newFacility, setNewFacility] = useState("");

  const form = useForm<LibrarySetupPayload>({
    resolver: zodResolver(librarySetupSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      address: "",
      district: "",
      state: "",
      pincode: "",
      floors: [{ name: "", totalSeats: 0 }],
      shifts: initialShiftsForm,
      facilities: [],
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = form;

  const {
    fields: floorFields,
    append: appendFloor,
    remove: removeFloor,
  } = useFieldArray({
    control,
    name: "floors",
  });

  const { fields: shiftFields } = useFieldArray({
    control,
    name: "shifts",
  });

  const currentFacilities = watch("facilities");

  const handleAddFacility = () => {
    const trimmed = newFacility.trim();
    if (trimmed && !currentFacilities.includes(trimmed)) {
      setValue("facilities", [...currentFacilities, trimmed]);
      setNewFacility("");
    }
  };

  const handleRemoveFacility = (facilityToRemove: string) => {
    setValue(
      "facilities",
      currentFacilities.filter((f) => f !== facilityToRemove),
    );
  };

  const handleProceedToInfrastructure = async () => {
    const isValid = await trigger([
      "name",
      "email",
      "contactNumber",
      "address",
      "district",
      "state",
      "pincode",
    ]);
    if (isValid) {
      setCurrentStep("infrastructure");
      setApiError(null);
    }
  };

  const onSubmit = async (data: LibrarySetupPayload) => {
    const hasActiveShift = data.shifts.some((s) => s.isActive);
    if (!hasActiveShift) {
      setApiError("Please activate at least one shift to continue.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await setupLibrary(data);
      router.push("/settings");
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to complete setup",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      {/* Step 1: Library Information */}
      {currentStep === "library" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  Library Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your library&apos;s basic details
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 size={16} className="text-primary" /> Library Name
              </label>
              <input
                {...register("name")}
                placeholder="Enter library name"
                className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                  errors.name
                    ? "border-destructive ring-2 ring-destructive/20"
                    : "border-border"
                }`}
              />
              {errors.name && (
                <p className="text-destructive text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail size={16} className="text-primary" /> Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="library@example.com"
                  className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                    errors.email
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-border"
                  }`}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Phone size={16} className="text-primary" /> Contact Number
                </label>
                <input
                  {...register("contactNumber")}
                  type="tel"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^0-9]/g,
                      "",
                    );
                  }}
                  maxLength={10}
                  placeholder="10-digit phone number"
                  className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                    errors.contactNumber
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-border"
                  }`}
                />
                {errors.contactNumber && (
                  <p className="text-destructive text-xs">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin size={16} className="text-primary" /> Full Address
              </label>
              <textarea
                {...register("address")}
                placeholder="Enter complete address"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm resize-none ${
                  errors.address
                    ? "border-destructive ring-2 ring-destructive/20"
                    : "border-border"
                }`}
              />
              {errors.address && (
                <p className="text-destructive text-xs">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  District
                </label>
                <input
                  {...register("district")}
                  placeholder="District"
                  className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                    errors.district
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-border"
                  }`}
                />
                {errors.district && (
                  <p className="text-destructive text-xs">
                    {errors.district.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  State
                </label>
                <input
                  {...register("state")}
                  placeholder="State"
                  className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                    errors.state
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-border"
                  }`}
                />
                {errors.state && (
                  <p className="text-destructive text-xs">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Pincode
                </label>
                <input
                  {...register("pincode")}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^0-9]/g,
                      "",
                    );
                  }}
                  maxLength={6}
                  placeholder="5-6 digits"
                  className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                    errors.pincode
                      ? "border-destructive ring-2 ring-destructive/20"
                      : "border-border"
                  }`}
                />
                {errors.pincode && (
                  <p className="text-destructive text-xs">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToInfrastructure}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
            >
              Next: Infrastructure Setup
              <ArrowRight size={16} />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Infrastructure Setup */}
      {currentStep === "infrastructure" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Facilities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">
                    Facilities
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Add optional facilities (optional)
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {currentFacilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentFacilities.map((facility) => (
                    <div
                      key={facility}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(facility)}
                        className="ml-1 text-primary/50 hover:text-destructive transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFacility();
                    }
                  }}
                  placeholder="e.g., WiFi, AC, Parking, etc."
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddFacility}
                  disabled={!newFacility.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold text-sm transition-all"
                >
                  Add
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Floors */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Floors</h2>
                  <p className="text-sm text-muted-foreground">
                    Add at least one floor to your library
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {floorFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      Floor {index + 1}
                    </span>
                    {floorFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFloor(index)}
                        className="text-destructive hover:text-destructive/80 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Floor Name
                      </label>
                      <input
                        {...register(`floors.${index}.name`)}
                        placeholder="e.g., Ground Floor"
                        className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                          errors.floors?.[index]?.name
                            ? "border-destructive ring-2 ring-destructive/20"
                            : "border-border"
                        }`}
                      />
                      {errors.floors?.[index]?.name && (
                        <p className="text-destructive text-xs">
                          {errors.floors[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Total Seats
                      </label>
                      <input
                        {...register(`floors.${index}.totalSeats`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Number of seats"
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          errors.floors?.[index]?.totalSeats
                            ? "border-destructive ring-2 ring-destructive/20"
                            : "border-border"
                        }`}
                      />
                      {errors.floors?.[index]?.totalSeats && (
                        <p className="text-destructive text-xs">
                          {errors.floors[index]?.totalSeats?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendFloor({ name: "", totalSeats: 0 })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-primary/50 text-primary rounded-lg hover:border-primary hover:bg-primary/5 transition-all font-semibold text-sm"
              >
                <Layers size={16} /> Add Another Floor
              </button>
            </CardContent>
          </Card>

          {/* Shifts */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">
                    Shifts & Pricing
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configure times and prices for your shifts
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {shiftFields.map((field, index) => {
                const isActive = watch(`shifts.${index}.isActive`);
                const shiftName = watch(`shifts.${index}.name`).replace(
                  "_",
                  " ",
                );

                return (
                  <div
                    key={field.id}
                    className={`space-y-4 p-4 rounded-lg border transition-colors ${
                      isActive
                        ? "bg-muted/30 border-border"
                        : "bg-background border-dashed border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          {...register(`shifts.${index}.isActive`)}
                          type="checkbox"
                          className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                        />
                        <span className="text-sm font-bold text-foreground">
                          {shiftName}
                        </span>
                      </label>
                    </div>

                    {isActive && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                            <Clock size={12} /> Start Time
                          </label>
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
                                className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                                  errors.shifts?.[index]?.startTime
                                    ? "border-destructive ring-2 ring-destructive/20"
                                    : "border-border"
                                }`}
                              />
                            )}
                          />
                          {errors.shifts?.[index]?.startTime && (
                            <p className="text-destructive text-xs">
                              {errors.shifts[index]?.startTime?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                            <Clock size={12} /> End Time
                          </label>
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
                                className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                                  errors.shifts?.[index]?.endTime
                                    ? "border-destructive ring-2 ring-destructive/20"
                                    : "border-border"
                                }`}
                              />
                            )}
                          />
                          {errors.shifts?.[index]?.endTime && (
                            <p className="text-destructive text-xs">
                              {errors.shifts[index]?.endTime?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Monthly Price
                          </label>
                          <input
                            {...register(`shifts.${index}.price`)}
                            type="number"
                            placeholder="Price"
                            className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none text-sm ${
                              errors.shifts?.[index]?.price
                                ? "border-destructive ring-2 ring-destructive/20"
                                : "border-border"
                            }`}
                          />
                          {errors.shifts?.[index]?.price && (
                            <p className="text-destructive text-xs">
                              {errors.shifts[index]?.price?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep("library")}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground font-semibold hover:bg-muted disabled:opacity-50 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Completing
                  Setup...
                </>
              ) : (
                <>
                  Complete Setup <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
