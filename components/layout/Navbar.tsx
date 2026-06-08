"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  ChevronRight,
  Home,
  Settings,
  Bell,
  GraduationCap,
  FileSpreadsheetIcon,
  HistoryIcon,
  Clock,
  Zap,
  MessageCircle,
  GalleryHorizontal,
  DollarSign,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = session
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Booking", href: "/seat-map", icon: FileSpreadsheetIcon },
        { name: "Student", href: "/student", icon: GraduationCap },
        { name: "History", href: "/history", icon: HistoryIcon },
        { name: "Expenses", href: "/expenses", icon: DollarSign},
        { name: "Request", href: "/inquiry-request", icon: Bell },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Shifts", href: "#shifts", icon: Clock },
        { name: "Facilities", href: "#facilities", icon: Zap },
        { name: "Gallery", href: "#gallery", icon: GalleryHorizontal },
        { name: "FAQs", href: "#faq", icon: MessageCircle },
      ];

  const handleLogout = async () => {
    setMobileOpen(false);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-0"
          : "bg-transparent border-transparent py-2"
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8 transition-all">
        {/* --- LEFT: LOGO --- */}
        <Link
          href="/"
          className="flex items-center transition-transform hover:scale-102"
        >
          <Image
            src="/RKLibrary/rkLibraryLogo.png"
            alt="RKLibrary Logo"
            width={180}
            height={60}
            className="h-auto w-auto"
            loading="eager"
          />
        </Link>

        {/* --- MIDDLE: DESKTOP NAVIGATION --- */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-full border border-gray-200/60 backdrop-blur-sm shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-4 py-2 text-sm rounded-full font-medium transition-all duration-200
                ${
                  isActive(link.href)
                    ? "bg-white text-primary shadow-sm inset-ring-1 inset-ring-gray-200/50"
                    : "text-gray-500 hover:text-gray-950 hover:bg-gray-100/50"
                }
              `}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* --- RIGHT: ACTIONS & MOBILE MENU --- */}
        <div className="flex items-center gap-4">
          {/* MOBILE MENU TRIGGER */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full bg-white/50 border border-gray-200/50 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="size-5 text-gray-700" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85vw] sm:w-80 flex flex-col p-0 border-r-0 rounded-r-3xl overflow-hidden bg-gray-50/95 backdrop-blur-2xl"
              >
                {/* Mobile Header */}
                <SheetHeader className="bg-white border-b border-gray-100">
                  <SheetTitle className="flex items-center gap-3 text-xl font-bold text-gray-950">
                    <Link
                      href="/"
                      className="flex items-center transition-transform hover:scale-102"
                    >
                      <Image
                        src="/RKLibrary/rkLibraryLogo.png"
                        alt="RKLibrary Logo"
                        width={80}
                        height={60}
                        className="h-auto w-auto"
                        loading="eager"
                      />
                    </Link>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu and user settings
                  </SheetDescription>
                </SheetHeader>

                {/* Mobile Nav Links */}
                <div className="flex-1 overflow-y-auto px-4">
                  <nav className="flex flex-col gap-2">
                    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Menu
                    </p>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`
                            flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all active:scale-[0.98]
                            ${
                              isActive(link.href)
                                ? "bg-white text-primary shadow-sm inset-ring-1 inset-ring-gray-200/50"
                                : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-950"
                            }
                          `}
                        >
                          <Icon
                            className={`size-5 ${isActive(link.href) ? "text-primary" : "text-gray-400"}`}
                          />
                          {link.name}
                          {isActive(link.href) && (
                            <ChevronRight className="ml-auto size-4 opacity-50" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Mobile User/Footer Section */}
                <div className="p-4">
                  <div className="bg-white rounded-3xl p-4 shadow-sm inset-ring-1 inset-ring-gray-200/50">
                    {isPending ? (
                      <div className="flex items-center gap-4">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ) : session ? (
                      <div className="flex flex-col gap-4">
                        <Link
                          href="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors group"
                        >
                          <Avatar className="size-10 border shadow-sm group-hover:scale-105 transition-transform">
                            <AvatarImage src={session.user.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {session.user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-bold text-gray-950 truncate">
                              {session.user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-secondary transition-colors"
                        >
                          <Settings className="size-5 text-primary" />
                          Settings
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full rounded-xl shadow-none"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 size-4" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button className="w-full rounded-xl" asChild>
                          <Link
                            href="/inquiry"
                            onClick={() => setMobileOpen(false)}
                          >
                            Pre-Booking
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* DESKTOP USER MENU */}
          <div className="hidden md:flex items-center">
            {isPending ? (
              <Skeleton className="size-10 rounded-full bg-gray-200" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative size-10 rounded-full p-0 ring-offset-background hover:bg-gray-100 transition-all focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Avatar className="size-10 border border-gray-200 shadow-sm hover:scale-105 transition-transform">
                      <AvatarImage
                        src={session.user.image || ""}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 rounded-2xl p-2"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-gray-100">
                        <AvatarImage src={session.user.image || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {session.user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-bold leading-none text-gray-950 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-gray-500 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-xl p-3 focus:bg-gray-100"
                    >
                      <Link href="/profile" className="w-full">
                        <User className="mr-2 size-4 text-gray-500" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-xl p-3 focus:bg-gray-100"
                    >
                      <Link href="/settings" className="w-full">
                        <Settings className="mr-2 size-4 text-gray-500" />{" "}
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <div className="p-1">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-xl p-3 font-medium"
                    >
                      <LogOut className="mr-2 size-4" /> Log out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button className="rounded-full shadow-md" asChild>
                  <Link href="/inquiry">Pre-Booking</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
