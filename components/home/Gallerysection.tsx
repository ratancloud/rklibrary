import Image from "next/image";
import { ImageIcon, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  src: string;
  title: string;
  subtitle?: string;
  span?: "tall" | "wide" | "normal";
}

const galleryImages: GalleryImage[] = [
  {
    src: "/RKLibrary/seat2.jpeg",
    title: "Main study hall",
    subtitle: "Ground floor · 56 seats",
    span: "normal",
  },
  {
    src: "/RKLibrary/seat6.jpeg",
    title: "Individual study desks",
    subtitle: "With power socket & light",
  },
  {
    src: "/RKLibrary/building.jpeg",
    title: "",
    subtitle: "Exterior view of RK Library",
    span: "tall",
  },
  {
    src: "/RKLibrary/seat7.jpeg",
    title: "Quiet reading zone",
    subtitle: "AC · High-speed Wi-Fi · CCTV",
    span: "normal",
  },
  {
    src: "/RKLibrary/lobby2.jpeg",
    title: "Library entrance",
    subtitle: "Open all shifts",
    span: "normal",
  },
  {
    src: "/RKLibrary/Ro.jpeg",
    title: "Ro Water Dispenser",
    subtitle: "Clean drinking water",
    span: "tall",
  },
  {
    src: "/RKLibrary/owner2.jpeg",
    title: "Owner's corner",
    subtitle: "Reserved for library owner",
    span: "tall",
  },
  {
    src: "/RKLibrary/seat4.jpeg",
    title: "Good lighting",
    subtitle: "Bright and comfortable study environment",
    span: "tall",
  },
];

function GalleryCard({ image }: { image: GalleryImage }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 cursor-pointer",
        image.span === "tall" && "row-span-2",
        image.span === "wide" && "col-span-2",
        image.span === "tall" ? "min-h-80" : "min-h-45",
      )}
    >
      {/* Image */}
      <Image
        src={image.src}
        alt={image.title}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Dark gradient overlay — always subtle, stronger on hover */}
      <div className="absolute inset-0 bg-linear-to-t from-gray-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Bottom label — slides up on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-sm font-bold text-white leading-snug">
          {image.title}
        </p>
        {image.subtitle && (
          <p className="text-xs text-white/65 mt-0.5">{image.subtitle}</p>
        )}
      </div>

      {/* Expand icon — top right */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-sm">
        <Maximize2 className="w-3.5 h-3.5 text-gray-800" strokeWidth={2.5} />
      </div>

      {/* Primary tint on hover */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-300 rounded-2xl" />
    </div>
  );
}

export function GallerySection() {
  return (
    <section id="gallery" className="py-20 max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Photo gallery
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-950 text-balance mb-4">
          Explore our library
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          See what makes our library the perfect study destination.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-[auto] gap-4">
        {galleryImages.map((image, idx) => (
          <GalleryCard key={idx} image={image} />
        ))}
      </div>
    </section>
  );
}
