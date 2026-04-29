"use client";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, MapPin, Zap, X, CheckCircle2 } from "lucide-react";
import { libraryFormSchema, type LibraryFormState } from "@/lib/validations";
import SettingCard from "./SettingCard";

interface LibraryBasicDetailsProps {
  data: Partial<LibraryFormState>;
  isLoading?: boolean;
  onSave?: (updates: LibraryFormState) => Promise<void>;
}

export const LibraryBasicDetails = ({
  data,
  isLoading,
  onSave,
}: LibraryBasicDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newFacility, setNewFacility] = useState("");

  // Initialize React Hook Form
  const form = useForm<LibraryFormState>({
    resolver: zodResolver(libraryFormSchema),
    values: {
      id: data.id || "",
      name: data.name || "",
      email: data.email || "",
      contactNumber: data.contactNumber || "",
      address: data.address || "",
      district: data.district || "",
      state: data.state || "",
      pincode: data.pincode || "",
      facilities: data.facilities || [],
    },
    mode: "onChange",
  });

  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = form;

  const currentFacilities = useWatch({
    control,
    name: "facilities",
    defaultValue: data.facilities || [],
  }) || [];

  // Facility Management functions
  const handleAddFacility = () => {
    const trimmed = newFacility.trim();
    if (trimmed && !currentFacilities.includes(trimmed)) {
      setValue("facilities", [...currentFacilities, trimmed], { shouldDirty: true });
      setNewFacility("");
    }
  };

  // Remove facility handler
  const handleRemoveFacility = (facilityToRemove: string) => {
    setValue(
      "facilities",
      currentFacilities.filter((f) => f !== facilityToRemove),
      { shouldDirty: true }
    );
  };

  // Form Submission
  const onSubmit = async (formData: LibraryFormState) => {
    try {
      await onSave?.(formData);
      setIsEditing(false);
      setNewFacility("");
    } catch (error) {
      console.error("Failed to update library details:", error);
    }
  };

  // Cancel Handler
  const handleCancel = () => {
    setIsEditing(false);
    reset(); 
    setNewFacility(""); 
  };  

  return (
    <SettingCard
      title="Library"
      icon={Building2}
      isEditing={isEditing}
      isLoading={isLoading}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSubmit(onSubmit)}
    >
      <div className="space-y-8">
        {/* Basic Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
          {/* Name */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} /> Library Name
            </p>
            {isEditing ? (
              <div>
                <input
                  {...register("name")}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${
                    errors.name ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold truncate">{data.name || "Not provided"}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Mail size={16} /> Email Address
            </p>
            {isEditing ? (
              <div>
                <input
                  {...register("email")}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${
                    errors.email ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold truncate">{data.email || "Not provided"}</p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Phone size={16} /> Contact
            </p>
            {isEditing ? (
              <div>
                <input
                  {...register("contactNumber")}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                  }}
                  maxLength={10}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${
                    errors.contactNumber ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.contactNumber && <p className="text-destructive text-xs mt-1">{errors.contactNumber.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold truncate">{data.contactNumber || "Not provided"}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} /> Full Address
            </p>
            {isEditing ? (
              <div>
                <textarea
                  {...register("address")}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium resize-none ${
                    errors.address ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold wrap-break-word">{data.address || "Not provided"}</p>
            )}
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              District
            </p>
            {isEditing ? (
              <div>
                <input
                  {...register("district")}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${
                    errors.district ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.district && <p className="text-destructive text-xs mt-1">{errors.district.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold truncate">{data.district || "Not provided"}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              State
            </p>
            {isEditing ? (
              <div>
                <input
                  {...register("state")}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${
                    errors.state ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold truncate">{data.state || "Not provided"}</p>
            )}
          </div>

          {/* Pincode */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              Pincode
            </p>
            {isEditing ? (
              <div>
                <input
                  {...register("pincode")}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                  }}
                  maxLength={6}
                  className={`w-full px-3 py-2 border rounded-lg bg-primary/5 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${
                    errors.pincode ? "border-destructive ring-2 ring-destructive/20" : "border-primary/20"
                  }`}
                />
                {errors.pincode && <p className="text-destructive text-xs mt-1">{errors.pincode.message}</p>}
              </div>
            ) : (
              <p className="text-foreground font-semibold truncate">{data.pincode || "Not provided"}</p>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Facilities Section */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} /> Available Facilities
          </p>

          <div className="flex flex-wrap gap-2">
            {currentFacilities.length === 0 && !isEditing ? (
              <p className="text-sm text-muted-foreground italic">No facilities added yet.</p>
            ) : (
              currentFacilities.map((facility, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary"
                >
                  <CheckCircle2 size={12} />
                  {facility}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(facility)}
                      className="ml-1 hover:text-destructive transition-colors focus:outline-none"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-2 md:w-1/2 lg:w-1/3">
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
                placeholder="e.g. WiFi, AC..."
                className="flex-1 px-3 py-1.5 border border-primary/20 rounded bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={handleAddFacility}
                disabled={!newFacility.trim()}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-semibold disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </SettingCard>
  );
};