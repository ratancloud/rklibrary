import { CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-150 lg:size-200 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance bg-linear-to-b from-gray-950 to-gray-600 bg-clip-text text-transparent mb-6">
            About Our Library
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            A world-class learning facility dedicated to providing the best
            study environment for students and scholars.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-950 mb-4">
                Our Story
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Established in 2025, our library was founded on a simple but
                powerful mission: to provide students with a dedicated,
                comfortable, and technology-enabled space for focused learning
                and intellectual growth.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-950 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                To create an inclusive, modern learning environment that
                supports academic excellence and fosters a community of engaged
                learners. We believe every student deserves access to quality
                study facilities.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-950">
                Why Choose Us?
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">
                      Modern Infrastructure
                    </p>
                    <p className="text-sm text-gray-600">
                      State-of-the-art facilities and equipment
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">
                      24/7 Accessibility
                    </p>
                    <p className="text-sm text-gray-600">
                      Available 6 AM to 10 PM with flexible shifts
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="size-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-950">
                      Diverse Spaces
                    </p>
                    <p className="text-sm text-gray-600">Quiet zones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-linear-to-br from-primary/20 to-primary/5 border border-gray-200 p-12 shadow-xl">
              <div className="space-y-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    250+
                  </div>
                  <p className="text-gray-600 font-medium">
                    Study Seats Across 1 Floors
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      100+
                    </div>
                    <p className="text-gray-600 font-medium">
                      Books & Digital Resources
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      250+
                    </div>
                    <p className="text-gray-600 font-medium">Active Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OWNER & CONTACT SECTION */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-950 mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Dedicated to providing the best learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            {/* Owner Image & Info */}
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden mb-6 flex items-center justify-center">
                <Image src="/RKLibrary/owner2.jpeg" alt="Library Owner" width={256} height={256} className="object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-gray-950 mb-2">
                Rajan Prakash
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Founder & Director
              </p>
              <p className="text-gray-600 text-center max-w-md text-sm leading-relaxed">
                Passionate about creating the perfect study environment for
                every student. With years of experience in education, bringing
                vision to life.
              </p>
            </div>

            {/* Contact & Address Info */}
            <div className="space-y-6">
              {/* Address */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-2">
                      Address
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Harihar Nagar Mohaddiganj, Opposite Near Om Palace, Sasaram
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-2">
                      Contact Number
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <a
                        href="tel:+919334722085"
                        className="hover:text-primary transition-colors"
                      >
                        +91 9334722085, +91 8340461404
                      </a>
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                      Available: 6 AM - 10 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-2">Email</h4>
                    <p className="text-gray-600 text-sm">
                      <a
                        href="mailto:rklibrary01@gmail.com"
                        className="hover:text-primary transition-colors"
                      >
                        rklibrary01@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
