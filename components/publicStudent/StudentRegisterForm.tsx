"use client";

import { useState, useRef } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import {
  Loader2,
  Upload,
  Trash2,
  User,
  CreditCard,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { upload } from "@imagekit/next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { publicAuthenticator } from "@/lib/publicImageClintAuth";
import { useRouter } from "next/navigation";

const studentRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  fatherName: z.string().min(2, "Father's name is required"),
  fatherPhone: z
    .string()
    .regex(/^\d{10}$/, "Father's phone must be exactly 10 digits"),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar number must be exactly 12 digits"),
  address: z.string().optional().or(z.literal("")),
  temporaryAddress: z.string().optional().or(z.literal("")),
});

type StudentRegisterFormData = z.infer<typeof studentRegisterSchema>;

interface ImageState {
  profileImage: { file: File | null; preview: string; fileId?: string | null };
  aadhaarFront: { file: File | null; preview: string; fileId?: string | null };
  aadhaarBack: { file: File | null; preview: string; fileId?: string | null };
}

export default function StudentRegisterForm({
  libraryId,
}: {
  libraryId: string;
}) {
  const router = useRouter();
  const [statusText, setStatusText] = useState("");

  const [images, setImages] = useState<ImageState>({
    profileImage: { file: null, preview: "", fileId: undefined },
    aadhaarFront: { file: null, preview: "", fileId: undefined },
    aadhaarBack: { file: null, preview: "", fileId: undefined },
  });

  const fileInputRefs = {
    profileImage: useRef<HTMLInputElement>(null),
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentRegisterFormData>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      name: "",
      gender: "",
      phoneNumber: "",
      fatherName: "",
      fatherPhone: "",
      aadhaarNumber: "",
      address: "",
      temporaryAddress: "",
    },
  });

  const handleFileSelect = (type: keyof ImageState, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload an image file");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("File exceeds 5MB limit");

    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => ({
        ...prev,
        [type]: {
          file,
          preview: e.target?.result as string,
          fileId: undefined,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadToImageKit = async (file: File) => {
    try {
      const authResponse = await publicAuthenticator();
      const { token, expire, signature, publicKey } = authResponse;

      // 2. Perform the upload using the fetched credentials
      const res = await upload({
        file,
        fileName: `public_${Date.now()}_${file.name}`,
        folder: "rklibrary/students",
        token,
        expire,
        signature,
        publicKey,
      });

      return { url: res.url || "", fileId: res.fileId || "" };
    } catch (error: any) {
      console.error("Upload Error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const rollbackUploadedImages = async (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    setStatusText("Reverting uploaded images...");
    try {
      const response = await fetch("/api/imagekit/public-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds }),
      });
      if (!response.ok) throw new Error("Batch rollback failed");
      console.log("Images rolled back successfully");
    } catch (err) {
      console.error("Critical: Failed to rollback images", err);
    }
  };

  const { mutate: registerStudent, isPending: loading } = useMutation({
    mutationFn: async (data: StudentRegisterFormData) => {
      const newlyUploadedFileIds: string[] = [];

      try {
        setStatusText("Uploading media...");
        const uploadKeys = [
          "profileImage",
          "aadhaarFront",
          "aadhaarBack",
        ] as Array<keyof ImageState>;

        // Only upload images that have files
        const keysToUpload = uploadKeys.filter((key) => images[key].file);

        const uploadPromises = keysToUpload.map(async (key) => {
          const result = await uploadToImageKit(images[key].file!);
          return { key, ...result };
        });

        const results = await Promise.all(uploadPromises);

        const uploadResults: Record<string, string | null> = {};

        results.forEach((res) => {
          uploadResults[`${res.key}Url`] = res.url;
          uploadResults[`${res.key}Id`] = res.fileId;
          newlyUploadedFileIds.push(res.fileId);
        });

        setStatusText("Submitting registration...");
        const response = await fetch("/api/student-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            libraryId,
            ...uploadResults,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to register");
        }

        return await response.json();
      } catch (err) {
        await rollbackUploadedImages(newlyUploadedFileIds);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(
        "Registration successful! We will verify your details and contact you soon.",
      );
      reset();
      setImages({
        profileImage: { file: null, preview: "", fileId: undefined },
        aadhaarFront: { file: null, preview: "", fileId: undefined },
        aadhaarBack: { file: null, preview: "", fileId: undefined },
      });
      setStatusText("");
      router.push("/registration-success");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Error occurred");
      setStatusText("");
    },
  });

  const onSubmit: SubmitHandler<StudentRegisterFormData> = (data) => {
    if (!images.profileImage.file)
      return toast.error("Profile image is required");
    if (!images.aadhaarFront.file)
      return toast.error("Aadhaar front image is required");

    registerStudent(data);
  };

  const handleNumericInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  const ImageUploadCard = ({
    type,
    label,
    icon: Icon,
  }: {
    type: keyof ImageState;
    label: string;
    icon: LucideIcon;
  }) => {
    const isProfile = type === "profileImage";
    return (
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-md hover:shadow-lg transition-all",
          loading && "opacity-60 pointer-events-none",
        )}
      >
        <CardHeader className="border-b">
          <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <Icon className="w-4 h-4" /> {label}
            </span>
            <span className="text-xs text-red-500 font-normal">* Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 pt-4">
          <div className="w-full space-y-3">
            <div
              className={cn(
                "relative group border-2 border-dashed rounded-lg bg-muted/10 flex items-center justify-center overflow-hidden",
                images[type].preview
                  ? "border-transparent"
                  : "border-muted-foreground/20",
                isProfile
                  ? "w-44 h-44 rounded-xl mx-auto"
                  : "w-full aspect-3/2 rounded-xl",
              )}
            >
              {images[type].preview ? (
                <>
                  <Image
                    src={images[type].preview}
                    alt={label}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => ({
                        ...prev,
                        [type]: { file: null, preview: "", fileId: null },
                      }));
                      if (fileInputRefs[type].current) {
                        fileInputRefs[type].current.value = "";
                      }
                    }}
                    className={cn(
                      "absolute top-2 right-2 z-10 rounded-full bg-destructive/90 hover:bg-destructive text-white shadow-lg transition-all duration-200",
                      "flex items-center justify-center p-2 w-8 h-8",
                      "hover:scale-110 active:scale-95",
                      "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                    )}
                    title="Remove image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-1" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Missing
                  </p>
                </div>
              )}
            </div>
            <div className="w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => fileInputRefs[type].current?.click()}
              >
                <Upload className="w-3 h-3 mr-1" /> Select File
              </Button>
              <input
                type="file"
                ref={fileInputRefs[type]}
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  handleFileSelect(type, e.target.files?.[0] || null)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Side: Form Data (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Personal */}
          <Card
            className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-shadow",
              loading && "opacity-60 pointer-events-none",
            )}
          >
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-blue-900">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-sm">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      className={cn(
                        "transition-colors",
                        errors.name &&
                        "border-destructive bg-red-50 dark:bg-red-950",
                      )}
                      disabled={loading}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="font-semibold text-sm">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className={cn(
                          "transition-colors w-full",
                          errors.gender &&
                          "border-destructive bg-red-50 dark:bg-red-950",
                        )}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-semibold text-sm">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      onChange={(e) =>
                        field.onChange(handleNumericInput(e.target.value))
                      }
                      className={cn(
                        "transition-colors",
                        errors.phoneNumber &&
                        "border-destructive bg-red-50 dark:bg-red-950",
                      )}
                      disabled={loading}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="aadhaarNumber"
                  className="font-semibold text-sm"
                >
                  Aadhaar Number <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="aadhaarNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="12-digit aadhaar number"
                      maxLength={12}
                      inputMode="numeric"
                      onChange={(e) =>
                        field.onChange(handleNumericInput(e.target.value))
                      }
                      className={cn(
                        "transition-colors",
                        errors.aadhaarNumber &&
                        "border-destructive bg-red-50 dark:bg-red-950",
                      )}
                      disabled={loading}
                    />
                  )}
                />
                {errors.aadhaarNumber && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.aadhaarNumber.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section: Guardian */}
          <Card
            className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-shadow",
              loading && "opacity-60 pointer-events-none",
            )}
          >
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-purple-900">
                Guardian Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName" className="font-semibold text-sm">
                  Father&apos;s Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fatherName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Father's full name"
                      className={cn(
                        "transition-colors",
                        errors.fatherName &&
                        "border-destructive bg-red-50 dark:bg-red-950",
                      )}
                      disabled={loading}
                    />
                  )}
                />
                {errors.fatherName && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.fatherName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherPhone" className="font-semibold text-sm">
                  Father&apos;s Phone <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fatherPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="10-digit phone number"
                      maxLength={10}
                      inputMode="numeric"
                      onChange={(e) =>
                        field.onChange(handleNumericInput(e.target.value))
                      }
                      className={cn(
                        "transition-colors",
                        errors.fatherPhone &&
                        "border-destructive bg-red-50 dark:bg-red-950",
                      )}
                      disabled={loading}
                    />
                  )}
                />
                {errors.fatherPhone && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.fatherPhone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section: Address */}
          <Card
            className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-shadow",
              loading && "opacity-60 pointer-events-none",
            )}
          >
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold text-green-900">
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">
                  Permanent Address
                </Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Enter your permanent address"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm">
                  Temporary Address
                </Label>
                <Controller
                  name="temporaryAddress"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Enter your temporary address (if different)"
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Media Management (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Profile & Documents
            </h2>

            <ImageUploadCard
              type="profileImage"
              label="Profile Picture"
              icon={User}
            />
            <ImageUploadCard
              type="aadhaarFront"
              label="Aadhaar Front"
              icon={CreditCard}
            />
            <ImageUploadCard
              type="aadhaarBack"
              label="Aadhaar Back"
              icon={CreditCard}
            />

            <Button type="submit" className="w-full py-4" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="text-sm">{statusText}</span>
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
