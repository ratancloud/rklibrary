import {
  Home,
  Info,
  CalendarCheck,
  LogIn,
  Zap,
  Clock,
  MessageCircle,
  CircleQuestionMark,
  GalleryHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  WhatsappIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/inquiry", label: "Inquiry", icon: CalendarCheck },
    { href: "/login", label: "Login", icon: LogIn },
  ];

  const libraryLinks = [
    { href: "#shifts", label: "Shift timings", icon: Clock },
    { href: "#facilities", label: "Facilities", icon: Zap },
    {
      href: "#how-preBooking-work",
      label: "How preBooking Work?",
      icon: CircleQuestionMark,
    },
    { href: "#gallery", label: "Gallery", icon: GalleryHorizontal },
    { href: "#faq", label: "FAQs", icon: MessageCircle },
  ];

  const socialLinks = [
    {
      href: "https://wa.me/yournumber",
      label: "WhatsApp",
      Icon: WhatsappIcon,
    },
    {
      href: "https://instagram.com/yourhandle",
      label: "Instagram",
      Icon: InstagramIcon,
    },
    {
      href: "https://facebook.com/yourpage",
      label: "Facebook",
      Icon: FacebookIcon,
    },
    {
      href: "https://youtube.com/yourchannel",
      label: "YouTube",
      Icon: YoutubeIcon,
    },
  ];

  return (
    <footer className="w-full bg-gray-950 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link
              href="/"
              className="flex items-center transition-transform hover:scale-102"
            >
              <Image
                src="/RKLibrary/rkLibraryLogo2.avif"
                alt="RKLibrary Logo"
                width={70}
                height={60}
                className="h-auto w-auto"
                loading="eager"
              />
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed">
              Your perfect study space. A modern, distraction-free environment
              built for focused learning and growth.
            </p>

            {/* Social icons */}
            <div className="flex md:hidden items-center gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-primary hover:bg-primary transition-all duration-200"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-600">
              Navigate
            </p>
            <nav className="flex flex-col gap-2.5">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-150 group"
                >
                  <Icon className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Library */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-600">
              Library
            </p>
            <nav className="flex flex-col gap-2.5">
              {libraryLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-150 group"
                >
                  <Icon className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Action */}
          <div className="hidden md:flex flex-col gap-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-600">
              Connect with us
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-primary hover:bg-primary transition-all duration-200"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-900 mb-7" />

        {/* Bottom bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} RKLibrary. All rights reserved.
          </p>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-800 text-[11px] text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
