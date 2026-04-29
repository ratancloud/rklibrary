import SeatMap from "@/components/seat-map/SeatMap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seat Map",
  description: "View available seats and book your study spot at MA Library",
};

export default function SeatMapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-6 pt-24 space-y-6">
        <SeatMap />
      </div>
    </div>
  );
}
