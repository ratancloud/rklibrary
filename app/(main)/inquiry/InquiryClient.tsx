"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import {
  Home,
  Clock,
  Users,
  Zap,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SHIFT_OPTIONS = [
  {
    value: "MORNING",
    label: "Morning",
    icon: "🌅",
    color: "from-orange-50 to-orange-100",
  },
  {
    value: "AFTERNOON",
    label: "Afternoon",
    icon: "☀️",
    color: "from-yellow-50 to-yellow-100",
  },
  {
    value: "EVENING",
    label: "Evening",
    icon: "🌆",
    color: "from-purple-50 to-purple-100",
  },
  {
    value: "NIGHT",
    label: "Night",
    icon: "🌙",
    color: "from-indigo-50 to-indigo-100",
  },
];

const BENEFITS = [
  {
    icon: Clock,
    title: "Flexible Hours",
    desc: "Choose shifts that match your schedule perfectly.",
  },
  {
    icon: Users,
    title: "Study Community",
    desc: "Join hundreds of focused students from your city.",
  },
  {
    icon: Zap,
    title: "Premium Amenities",
    desc: "High-speed Wi-Fi, power backup & comfortable seating.",
  },
];

type FormData = {
  name: string;
  gender: string;
  phone: string;
  date: string;
  address: string;
  message: string;
};

export default function InquiryClient() {
  const [loading, setLoading] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      gender: "",
      phone: "",
      date: "",
      address: "",
      message: "",
    },
    mode: "onChange",
  });

  const toggleShift = (shift: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift],
    );
  };

  async function onSubmit(data: FormData) {
    if (selectedShifts.length === 0) {
      toast.error("Please select at least one shift");
      return;
    }

    setLoading(true);

    const submitData = {
      name: data.name,
      gender: data.gender,
      phoneNumber: data.phone,
      address: data.address,
      joiningDate: data.date ? new Date(data.date) : null,
      message: data.message,
      shiftNames: selectedShifts,
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        toast.success(
          "✓ Inquiry submitted! We'll contact you within 1 day via call or WhatsApp.",
        );
        reset();
        setSelectedShifts([]);
      } else {
        toast.error("Failed to send inquiry");
      }
    } catch {
      toast.error("Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mt-16 mx-auto p-4 md:p-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  <Home className="w-4 h-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary">
                Booking Inquiry
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Info & Process */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-gray-950">
                Find Your Study Seat
              </h1>
              <p className="text-sm text-gray-600">
                Quick inquiry form to get started
              </p>
            </div>

            {/* What Happens Next - Compact */}
            <div className="bg-linear-to-br from-primary/5 to-blue-50 rounded-2xl border border-primary/10 p-4 space-y-3">
              <h3 className="font-bold text-gray-950 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                What Happens Next?
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Submit your details</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>We verify within 24 hours</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Call/WhatsApp with details</span>
                </div>
              </div>
              <div className="pt-3 border-t border-primary/10 flex items-center gap-2 text-xs font-semibold text-gray-700">
                <MessageCircle size={14} className="text-primary" />
                We respond in 1 day
              </div>
            </div>

            {/* Trust Badges - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="font-semibold">100% Confidential</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <PhoneCall size={14} className="text-blue-600" />
                <span className="font-semibold">Call/WhatsApp Support</span>
              </div>
            </div>

            {/* Benefits - Compact */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Benefits
              </p>
              {BENEFITS.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={i}
                    className="flex gap-2 p-2 rounded-lg bg-white border border-gray-200"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-950">
                        {benefit.title}
                      </p>
                      <p className="text-xs text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold text-gray-700 flex justify-between"
                    >
                      <span>Full Name *</span>
                      {errors.name && (
                        <span className="text-red-500 text-xs font-normal">
                          {(errors.name.message as string) || "Required"}
                        </span>
                      )}
                    </Label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          className={`h-9 rounded-lg text-sm ${errors.name ? "border-red-400 bg-red-50/50 focus-visible:ring-red-500" : ""}`}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="gender"
                      className="text-xs font-semibold text-gray-700 flex justify-between"
                    >
                      <span>Gender *</span>
                      {errors.gender && (
                        <span className="text-red-500 text-xs font-normal">
                          {(errors.gender.message as string) || "Required"}
                        </span>
                      )}
                    </Label>
                    <Controller
                      name="gender"
                      control={control}
                      rules={{ required: "Gender is required" }}
                      render={({ field: { value, onChange } }) => (
                        <Select value={value} onValueChange={onChange}>
                          <SelectTrigger
                            id="gender"
                            className={`h-9 rounded-lg text-sm w-full ${
                              errors.gender
                                ? "border-red-400 bg-red-50/50 focus:ring-red-500"
                                : ""
                            }`}
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
                  </div>
                </div>

                {/* Phone & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-semibold text-gray-700 flex justify-between"
                    >
                      <span>Phone *</span>
                      {errors.phone && (
                        <span className="text-red-500 text-xs font-normal">
                          {(errors.phone.message as string) || "Required"}
                        </span>
                      )}
                    </Label>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        required: "Phone is required",
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Must be exactly 10 digits",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          className={`h-9 rounded-lg text-sm ${errors.phone ? "border-red-400 bg-red-50/50 focus-visible:ring-red-500" : ""}`}
                          onInput={(e) => {
                            e.currentTarget.value =
                              e.currentTarget.value.replace(/\D/g, "");
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="date"
                      className="text-xs font-semibold text-gray-700 flex justify-between"
                    >
                      <span>Joining Date</span>
                      {errors.date && (
                        <span className="text-red-500 text-xs font-normal">
                          {errors.date.message as string}
                        </span>
                      )}
                    </Label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="date"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className={`h-9 rounded-lg text-sm ${errors.date ? "border-red-400 bg-red-50/50" : ""}`}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <Label
                    htmlFor="address"
                    className="text-xs font-semibold text-gray-700 flex justify-between"
                  >
                    <span>Address</span>
                    {errors.address && (
                      <span className="text-red-500 text-xs font-normal">
                        {errors.address.message as string}
                      </span>
                    )}
                  </Label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="address"
                        placeholder="Your address..."
                        rows={2}
                        className={`rounded-lg text-sm resize-none ${errors.address ? "border-red-400 bg-red-50/50" : ""}`}
                      />
                    )}
                  />
                </div>

                {/* Shift Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex justify-between">
                    <span>Preferred Shifts *</span>
                    {selectedShifts.length === 0 && (
                      <span className="text-red-500 text-xs font-normal">
                        Please select at least one shift
                      </span>
                    )}
                  </Label>
                  <div
                    className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${
                      selectedShifts.length === 0
                        ? "p-2 rounded-lg border border-red-300 bg-red-50/30"
                        : ""
                    }`}
                  >
                    {SHIFT_OPTIONS.map((shift) => (
                      <button
                        key={shift.value}
                        type="button"
                        onClick={() => toggleShift(shift.value)}
                        className={`relative rounded-lg p-2 font-medium transition-all border-2 text-center ${
                          selectedShifts.includes(shift.value)
                            ? `bg-linear-to-br ${shift.color} border-primary shadow-sm`
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-lg">{shift.icon}</div>
                        <div className="text-xs font-semibold text-gray-950">
                          {shift.label}
                        </div>
                        {selectedShifts.includes(shift.value) && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 size={14} className="text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <Label
                    htmlFor="message"
                    className="text-xs font-semibold text-gray-700 flex justify-between"
                  >
                    <span>Special Requests</span>
                    {errors.message && (
                      <span className="text-red-500 text-xs font-normal">
                        {errors.message.message as string}
                      </span>
                    )}
                  </Label>
                  <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="message"
                        placeholder="Any special requirements..."
                        rows={2}
                        className={`rounded-lg text-sm resize-none ${errors.message ? "border-red-400 bg-red-50/50" : ""}`}
                      />
                    )}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg h-10 text-sm font-semibold mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Inquiry"
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  ✓ Quick response • 100% confidential
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* DIRECTOR CONTACT SECTION */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-950 mb-6 text-center">
            Need Direct Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Director Name */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-950 mb-2">
                Rajan Prakash
              </h3>
              <p className="text-gray-600 text-sm">
                Director
              </p>
            </div>

            {/* Address */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-950 self-center">Address</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Harihar Nagar Mohaddiganj, Opposite Near Om Palace, Sasaram
              </p>
            </div>

            {/* Contact Number */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-950 self-center">Contact</h4>
              </div>
              <p className="text-gray-600 text-sm">
                <a
                  href="tel:+919334722085"
                  className="hover:text-primary transition-colors font-semibold"
                >
                  +91 9334722085, +91 8340461404
                </a>
              </p>
              <p className="text-gray-500 text-xs mt-2">Available: 6 AM - 10 PM</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
