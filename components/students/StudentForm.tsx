"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import {
  Loader2,
  Camera,
  Upload,
  X,
  User,
  CreditCard,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import Webcam from "react-webcam";
import { upload } from "@imagekit/javascript";
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
import { authenticator } from "@/lib/imageClintAuth";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
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
    .optional()
    .refine(
      (val) => !val || /^\d{12}$/.test(val),
      "Aadhaar number must be exactly 12 digits",
    )
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  temporaryAddress: z.string().optional().or(z.literal("")),
  lockerNumber: z.union([z.number(), z.string()]).optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentInitialData {
  id?: string;
  name?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  fatherName?: string | null;
  fatherPhone?: string | null;
  aadhaarNumber?: string | null;
  address?: string | null;
  temporaryAddress?: string | null;
  lockerNumber?: number | null;
  profileImageUrl?: string | null;
  aadhaarFrontUrl?: string | null;
  aadhaarBackUrl?: string | null;
}

interface ImageState {
  profileImage: { file: File | null; preview: string; fileId?: string };
  aadhaarFront: { file: File | null; preview: string; fileId?: string };
  aadhaarBack: { file: File | null; preview: string; fileId?: string };
}

export default function StudentForm({
  initialData,
  isEditing = false,
  onSuccess,
}: {
  initialData?: StudentInitialData;
  isEditing?: boolean;
  onSuccess?: () => void;
}) {
  const [statusText, setStatusText] = useState("");
  const [cameraActive, setCameraActive] = useState<keyof ImageState | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // ADDED: Camera flip state

  const [images, setImages] = useState<ImageState>({
    profileImage: {
      file: null,
      preview: initialData?.profileImageUrl ?? "",
      fileId: undefined,
    },
    aadhaarFront: {
      file: null,
      preview: initialData?.aadhaarFrontUrl ?? "",
      fileId: undefined,
    },
    aadhaarBack: {
      file: null,
      preview: initialData?.aadhaarBackUrl ?? "",
      fileId: undefined,
    },
  });

  const webcamRef = useRef<Webcam>(null);
  const fileInputRefs = {
    profileImage: useRef<HTMLInputElement>(null),
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    const currentWebcam = webcamRef.current;

    return () => {
      const video = currentWebcam?.video;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      gender: initialData?.gender ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      fatherName: initialData?.fatherName ?? "",
      fatherPhone: initialData?.fatherPhone ?? "",
      aadhaarNumber: initialData?.aadhaarNumber ?? "",
      address: initialData?.address ?? "",
      temporaryAddress: initialData?.temporaryAddress ?? "",
      lockerNumber: initialData?.lockerNumber ?? "",
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
        [type]: { file, preview: e.target?.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const closeWebcam = useCallback(() => {
    const video = webcamRef.current?.video;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setCameraActive(null);
    setCameraReady(false);
  }, []);

  const capturePhoto = useCallback(
    (type: keyof ImageState) => {
      const screenshot = webcamRef.current?.getScreenshot();
      if (!screenshot) return toast.error("Camera not ready");

      // Stop stream immediately so the UI closes right away
      const video = webcamRef.current?.video;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
      setCameraActive(null);
      setCameraReady(false);

      // Then do the async blob conversion in the background
      fetch(screenshot)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `${type}-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          handleFileSelect(type, file);
        });
    },
    [],
  );

  const uploadToImageKit = async (file: File) => {
    const { signature, expire, token, publicKey } = await authenticator();
    const res = await upload({
      expire,
      token,
      signature,
      publicKey,
      file,
      fileName: file.name,
      folder: "rklibrary/students",
    });
    return { url: res.url || "", fileId: res.fileId || "" };
  };

  const rollbackUploadedImages = async (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    setStatusText("Reverting uploaded images...");
    try {
      const response = await fetch("/api/imagekit/delete", {
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

  const { mutate: submitStudent, isPending: loading } = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const newlyUploadedFileIds: string[] = [];

      try {
        setStatusText("Uploading media...");

        const uploadKeys = (
          Object.keys(images) as Array<keyof ImageState>
        ).filter(
          (key) => images[key].file && !images[key].preview.startsWith("https"),
        );

        const uploadPromises = uploadKeys.map(async (key) => {
          const result = await uploadToImageKit(images[key].file!);
          return { key, ...result };
        });

        const results = await Promise.all(uploadPromises);

        const uploadResults: Record<string, string> = {};

        (Object.keys(images) as Array<keyof ImageState>).forEach((key) => {
          if (!uploadKeys.includes(key)) {
            uploadResults[`${key}Url`] = images[key].preview;
          }
        });

        results.forEach((res) => {
          uploadResults[`${res.key}Url`] = res.url;
          uploadResults[`${res.key}Id`] = res.fileId;
          newlyUploadedFileIds.push(res.fileId);
        });

        setStatusText("Saving student profile...");
        const payload = {
          ...data,
          ...uploadResults,
          lockerNumber: data.lockerNumber ? Number(data.lockerNumber) : null,
        };

        const res = await fetch(
          isEditing ? `/api/students/${initialData?.id}` : "/api/students",
          {
            method: isEditing ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save student data");
        }

        return await res.json();
      } catch (err) {
        await rollbackUploadedImages(newlyUploadedFileIds);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Profile updated" : "Student registered");
      if (!isEditing) reset();
      onSuccess?.();
      setStatusText("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Error occurred");
      setStatusText("");
    },
  });

  const onSubmit: SubmitHandler<StudentFormData> = (data) => {
    submitStudent(data);
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
          cameraActive === type ? "ring-2 ring-primary" : "",
          loading && "opacity-60 pointer-events-none",
        )}
      >
        <CardHeader className="border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Icon className="w-4 h-4" /> {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {cameraActive === type ? (
            <div className="w-full space-y-3">
              <div
                className={cn(
                  "relative bg-black rounded-lg overflow-hidden w-full",
                  isProfile ? "aspect-square" : "aspect-3/2",
                )}
              >
                <Webcam
                  key={type}
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: facingMode, // UPDATED: Use the facingMode state
                    aspectRatio: isProfile ? 1 : 1.5,
                  }}
                  onUserMedia={() => setCameraReady(true)}
                  className="w-full h-full object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    Initializing...
                  </div>
                )}
                <div
                  className={cn(
                    "absolute inset-4 border-2 border-dashed border-white/40 pointer-events-none",
                    isProfile && "rounded-full",
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={() => capturePhoto(type)}
                  disabled={!cameraReady}
                >
                  Capture
                </Button>
                {/* ADDED: Flip Camera Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setFacingMode((prev) => prev === "user" ? "environment" : "user")}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={closeWebcam}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div
                className={cn(
                  "relative group border-2 border-dashed rounded-lg bg-muted/10 flex items-center justify-center overflow-hidden",
                  images[type].preview
                    ? "border-transparent"
                    : "border-muted-foreground/20",
                  isProfile
                    ? "w-32 h-32 rounded-full mx-auto"
                    : "w-full aspect-3/2",
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
                      onClick={() =>
                        setImages((prev) => ({
                          ...prev,
                          [type]: { file: null, preview: "" },
                        }))
                      }
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-muted-foreground/30 mb-1" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Missing
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setCameraReady(false);
                    setFacingMode(isProfile ? "user" : "environment"); // ADDED: Smart default facing mode based on image type
                    setCameraActive(type);
                  }}
                >
                  <Camera className="w-3 h-3 mr-1" /> Camera
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => fileInputRefs[type].current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" /> File
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
          )}
        </CardContent>
      </Card>
    );
  };

  const handleNumericInput = (value: string) => {
    return value.replace(/[^0-9]/g, "");
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
            <CardContent className="space-y-4">
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
                  Aadhaar Number
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
            <CardContent className="space-y-4">
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
                Address & Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label className="font-semibold text-sm">Locker Number</Label>
                <Controller
                  name="lockerNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Assigned locker number"
                      inputMode="numeric"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? handleNumericInput(e.target.value)
                            : "",
                        )
                      }
                      className="transition-colors"
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
              ) : isEditing ? (
                "Update Profile"
              ) : (
                "Register Student"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}