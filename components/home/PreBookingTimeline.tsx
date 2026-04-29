import Link from "next/link";
import {
  FileText,
  CheckSquare2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Calendar,
  Monitor,
  Phone,
  Star,
  Wifi,
  Lock,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    tag: "Step 1",
    Icon: FileText,
    title: "Fill the quick form",
    description:
      "Share your basic details and study preferences. Takes under 2 minutes — name, phone, preferred shifts, and joining date.",
    pills: [
      { icon: User, label: "Name & contact" },
      { icon: Clock, label: "Preferred shift" },
      { icon: Calendar, label: "Joining date" },
    ],
    isFinal: false,
  },
  {
    number: "02",
    tag: "Step 2",
    Icon: CheckSquare2,
    title: "Instant availability check",
    description:
      "Our system verifies real-time seat availability for your requested shift. You get matched to the best available option automatically.",
    pills: [
      { icon: Monitor, label: "Real-time seats" },
      { icon: CheckSquare2, label: "Auto-matched" },
    ],
    isFinal: false,
  },
  {
    number: "03",
    tag: "Step 3",
    Icon: MessageSquare,
    title: "We reach out to you",
    description:
      "Your librarian calls or WhatsApps within 24 hours to confirm your seat, discuss payment, and answer any questions before you visit.",
    pills: [
      { icon: Phone, label: "Call / WhatsApp" },
      { icon: Clock, label: "Within 24 hours" },
    ],
    isFinal: false,
  },
  {
    number: "04",
    tag: "Step 4",
    Icon: Sparkles,
    title: "Your seat is ready",
    description:
      "Visit the library, complete payment, and start studying on day one. Your locker, shift card, and Wi-Fi access are all set and waiting.",
    pills: [
      { icon: IndianRupee, label: "Pay & confirm" },
      { icon: Lock, label: "Locker assigned" },
      { icon: Wifi, label: "Wi-Fi ready" },
    ],
    isFinal: true,
  },
];

export function PreBookingTimeline() {
  return (
    <section id="how-preBooking-work" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Simple process
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 mb-4">
          How pre-booking works
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          4 simple steps. Book now, get confirmed within 24 hours.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical track line */}
        <div
          className="absolute left-8.75 md:left-10.75 top-14 bottom-14 w-px bg-linear-to-b from-gray-200 via-primary/40 to-gray-200"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-6">
          {steps.map((step, idx) => {
            const Icon = step.Icon;
            return (
              <div key={idx} className="flex items-start gap-6 md:gap-8 group">
                {/* Left: number bubble */}
                <div className="flex flex-col items-center shrink-0 z-10">
                  <div
                    className={cn(
                      "w-18 h-18 md:w-22 md:h-22 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-center relative transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10",
                      step.isFinal
                        ? "bg-gray-950 border-gray-800"
                        : "bg-white border-gray-200",
                    )}
                  >
                    <span
                      className={cn(
                        "text-xl md:text-2xl font-extrabold tracking-tight leading-none",
                        step.isFinal
                          ? "text-primary"
                          : "text-gray-300 group-hover:text-primary transition-colors duration-300",
                      )}
                    >
                      {step.number}
                    </span>
                    {/* Icon badge */}
                    <div className="absolute -bottom-3 -right-3 w-7 h-7 rounded-lg bg-primary flex items-center justify-center border-2 border-gray-50">
                      <Icon
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: card */}
                <div
                  className={cn(
                    "flex-1 rounded-3xl border p-6 md:p-8 transition-all duration-300 group-hover:shadow-lg",
                    step.isFinal
                      ? "bg-gray-950 border-gray-800 group-hover:border-primary/40 group-hover:shadow-primary/10"
                      : "bg-white border-gray-200 group-hover:border-primary/30 group-hover:shadow-primary/8",
                  )}
                >
                  {/* Tag */}
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-3",
                      step.isFinal
                        ? "bg-primary/20 text-primary"
                        : "bg-primary/8 text-primary",
                    )}
                  >
                    <Star className="w-3 h-3" />
                    {step.tag}
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      "text-xl md:text-2xl font-bold tracking-tight mb-2",
                      step.isFinal ? "text-white" : "text-gray-950",
                    )}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={cn(
                      "text-sm md:text-base leading-relaxed mb-5",
                      step.isFinal ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    {step.description}
                  </p>

                  {/* Pills */}
                  <div className="flex flex-wrap gap-2">
                    {step.pills.map((pill, pIdx) => {
                      const PillIcon = pill.icon;
                      return (
                        <span
                          key={pIdx}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                            step.isFinal
                              ? "bg-white/8 border-white/10 text-gray-300"
                              : "bg-gray-50 border-gray-200 text-gray-600",
                          )}
                        >
                          <PillIcon className="w-3 h-3 opacity-70" />
                          {pill.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-14">
        <Button
          asChild
          size="lg"
          className="h-14 px-8 rounded-full text-base shadow-xl shadow-primary/20 group"
        >
          <Link href="/inquiry">
            Pre-book your seat
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
