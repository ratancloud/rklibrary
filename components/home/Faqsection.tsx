"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How do I book a seat at the library?",
    a: "Fill out our pre-booking inquiry form online. Our team will contact you within 24 hours to confirm your seat, preferred shift, and payment details. Once confirmed, your seat will be reserved and ready on your joining date.",
  },
  {
    q: "What shifts are available and what are the timings?",
    a: "We offer four shifts — Morning, Afternoon, Evening, and Night. Each shift has dedicated seating designed to suit every type of student schedule. You can check the exact timings in our Shift Timings section.",
  },
  {
    q: "Can I book more than one shift at the same time?",
    a: "Yes! You can subscribe to multiple shifts on the same seat. For example, you can book both the Morning and Afternoon shifts. Each shift is billed separately based on its individual price.",
  },
  {
    q: "What happens when my subscription expires?",
    a: "Subscriptions automatically expire at midnight on the end date. Your seat assignment will be released unless you renew before or immediately after expiry. You can renew for 1–12 months at any time.",
  },
  {
    q: "Is Wi-Fi and power backup included for all members?",
    a: "Yes. Every seat comes with access to high-speed Wi-Fi, an individual power socket, personalized desk lighting, and 24-hour power backup — all included in every subscription plan at no extra cost.",
  },
  {
    q: "Is there a locker facility available?",
    a: "Yes, lockers are available for members to securely store books and personal belongings. Locker availability depends on your subscription plan — ask our team when confirming your booking.",
  },
  {
    q: "Can I change my seat or shift after joining?",
    a: "Seat or shift changes depend on current availability. Please contact our team directly and we will do our best to accommodate your request. Changes are generally possible at the time of renewal.",
  },
];

function FaqItem({
  q,
  a,
  open,
  onClick,
}: {
  q: string;
  a: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0 first:border-t first:border-gray-100">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span
          className={cn(
            "text-base font-bold leading-snug transition-colors duration-200",
            open ? "text-primary" : "text-gray-950 group-hover:text-primary"
          )}
        >
          {q}
        </span>
        <div
          className={cn(
            "shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-300",
            open
              ? "bg-primary border-primary rotate-45"
              : "bg-gray-50 border-gray-200"
          )}
        >
          <Plus
            className={cn(
              "w-3.5 h-3.5 transition-colors duration-200",
              open ? "text-white" : "text-gray-400"
            )}
            strokeWidth={2.5}
          />
        </div>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-64 pb-5" : "max-h-0"
        )}
      >
        <p className="text-[15px] text-gray-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Got questions?
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to know before joining .
          </p>
        </div>

        {/* Accordion */}
        <div className="mb-12">
          {faqs.map((faq, idx) => (
            <FaqItem
              key={idx}
              q={faq.q}
              a={faq.a}
              open={openIdx === idx}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="rounded-3xl bg-gray-950 px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-base font-bold text-white mb-1">
              Still have questions?
            </p>
            <p className="text-sm text-gray-500">
              We typically reply within a few hours on WhatsApp.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-full h-11 px-6 text-sm shadow-xl shadow-primary/20 group"
          >
            <Link href="/inquiry" className="inline-flex items-center">
              Contact us
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
    </section>
  );
}