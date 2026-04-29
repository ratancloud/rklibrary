"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddStudentDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddStudentDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      gender: "",
      phoneNumber: "",
      address: "",
      lockerNumber: "",
    },
  });

  const onSubmit = async (data: {
    name: string;
    gender: string;
    phoneNumber: string;
    address: string;
    lockerNumber: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lockerNumber: data.lockerNumber
            ? parseInt(data.lockerNumber, 10)
            : null,
        }),
      });

      if (res.ok) {
        toast.success("Student added successfully");
        reset();
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to add student");
      }
    } catch (err) {
      console.error("Error adding student:", err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground flex items-center gap-2">
            <Plus className="size-5" /> Add New Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                Name{" "}
                {errors.name && (
                  <span className="text-destructive lowercase font-normal">
                    {errors.name.message as string}
                  </span>
                )}
              </Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Student name"
                    className={`bg-muted/50 border-border ${errors.name ? "border-destructive" : ""}`}
                  />
                )}
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                Gender{" "}
                {errors.gender && (
                  <span className="text-destructive lowercase font-normal">
                    Required
                  </span>
                )}
              </Label>
              <Controller
                name="gender"
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger
                      className={`bg-muted/50 border-border ${errors.gender ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                Phone{" "}
                {errors.phoneNumber && (
                  <span className="text-destructive lowercase font-normal">
                    {errors.phoneNumber.message as string}
                  </span>
                )}
              </Label>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: "Required",
                  pattern: { value: /^\d{10}$/, message: "10 digits required" },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    placeholder="10 digit mobile"
                    maxLength={10}
                    className={`bg-muted/50 border-border ${errors.phoneNumber ? "border-destructive" : ""}`}
                    onInput={(e) =>
                      (e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        "",
                      ))
                    }
                  />
                )}
              />
            </div>

            {/* Locker Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                Locker No.
              </Label>
              <Controller
                name="lockerNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    min={0}
                    type="number"
                    placeholder="Optional"
                    className="bg-muted/50 border-border"
                  />
                )}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase">
              Address
            </Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={2}
                  placeholder="Optional address"
                  className="bg-muted/50 border-border resize-none"
                />
              )}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
