import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Armchair,
  Wifi,
  ArrowRight,
  ChevronRight,
  MapPin,
  BookOpen,
  Zap,
  Car,
  Lightbulb,
  Newspaper,
  BatteryCharging,
  Video,
  Wind,
  Droplets,
  Lock,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { ShiftsSection } from "@/components/shifts/ShiftsSection";
import { PreBookingTimeline } from "@/components/home/PreBookingTimeline";
import { FaqSection } from "@/components/home/Faqsection";
import { GallerySection } from "@/components/home/Gallerysection";

export const metadata = {
  title: "Home",
  description:
    "Discover the perfect study environment at RKLibrary. Book your seat today and experience world-class facilities designed for focused study and intellectual growth.",
};

export default function Home() {
  const facilities = [
    {
      icon: BookOpen,
      title: "Peaceful Environment",
      desc: "Quiet and distraction-free self-study centre",
    },
    {
      icon: Armchair,
      title: "Comfortable Furniture",
      desc: "Ergonomic seating for long study hours",
    },
    {
      icon: Wind,
      title: "Fully Air Conditioned",
      desc: "Fully AC campus for a comfortable environment",
    },
    {
      icon: Droplets,
      title: "RO Drinking Water",
      desc: "Clean and safe purified drinking water",
    },
    {
      icon: Wifi,
      title: "High Speed Wi-Fi",
      desc: "Seamless internet connectivity for online resources",
    },
    {
      icon: Video,
      title: "CCTV Camera",
      desc: "24/7 surveillance for student safety",
    },
    {
      icon: Zap,
      title: "Individual Power Socket",
      desc: "Dedicated charging ports at every desk",
    },
    {
      icon: Lightbulb,
      title: "Individual Light",
      desc: "Personalized desk lighting for focused reading",
    },
    {
      icon: BatteryCharging,
      title: "24 Hours Power Backup",
      desc: "Uninterrupted study sessions without power cuts",
    },
    {
      icon: Newspaper,
      title: "Newspapers & Magazines",
      desc: "Daily newspapers and monthly magazines available",
    },
    {
      icon: Lock,
      title: "Locker Facility",
      desc: "Secure storage for your books and personal belongings",
    },
    {
      icon: Car,
      title: "Parking",
      desc: "Dedicated parking space for vehicles",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-150 lg:size-200 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full inset-ring-1 inset-ring-primary/20 bg-primary/5 hover:bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 transition-colors cursor-default">
            <MapPin className="size-4 mr-2" />
            Your Favorite Study Destination
            <ChevronRight className="ml-1 size-4 opacity-50" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance bg-linear-to-b from-gray-950 to-gray-600 bg-clip-text text-transparent mb-6">
            Welcome to Our Library
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-balance mb-10">
            A modern, welcoming space designed for focused study, collaboration,
            and intellectual growth. Book your seat today and join thousands of
            students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto z-10">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 rounded-full w-full sm:w-auto group text-base shadow-xl shadow-primary/20"
            >
              <Link href="/inquiry">
                Pre-Booking
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-full w-full sm:w-auto bg-white hover:bg-gray-50 text-base inset-ring-1 inset-ring-gray-200 border-0"
            >
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>

        {/* HERO IMAGE PLACEHOLDER */}
        <div className="max-w-5xl mx-auto px-4 mt-20 relative z-10 perspective-[2000px]">
          <div className="rounded-4xl bg-linear-to-br from-primary/20 to-primary/5 backdrop-blur-2xl inset-ring-1 inset-ring-gray-200/50 shadow-2xl shadow-gray-200/50 overflow-hidden transform-gpu transition-transform duration-700 hover:rotate-x-4 h-130">
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/RKLibrary/seat2.jpeg"
                alt="Library Hero Image"
                width={800}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SHIFT TIMINGS SECTION */}
      <ShiftsSection
        title="Our Shift Timings"
        subtitle="Choose the shift that works best for your study schedule."
        variant="home"
      />

      {/* FACILITIES SECTION */}
      <section id="facilities" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Why Students Love Us
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 mb-4">
              World-Class Facilities
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need for a productive study experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group relative">
                  {/* Card */}
                  <div className="relative h-full bg-linear-to-br from-white via-white to-primary/3 border border-primary/15 rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/15">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-primary/0 via-transparent to-primary/0 group-hover:from-primary/5 group-hover:to-primary/3 transition-all duration-500" />

                    {/* Decorative corner accent */}
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                      {/* Icon container */}
                      <div className="inline-flex">
                        <div className="p-4 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary transition-all duration-300 group-hover:from-primary/30 group-hover:to-primary/20">
                          <Icon className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-950 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed pb-4">
                        {feature.desc}
                      </p>
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/3 blur-2xl opacity-0 group-hover:opacity-50 -z-10 transition-opacity duration-500" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PreBookingTimeline />

      <GallerySection />

      <FaqSection />
    </div>
  );
}
