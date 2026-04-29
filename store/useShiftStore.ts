import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Shift {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  price: number;
  isActive: boolean;
}

interface ShiftStore {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  fetchShifts: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useShiftStore = create<ShiftStore>()(
  devtools(
    (set) => ({
      shifts: [],
      isLoading: false,
      error: null,

      fetchShifts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/library/shifts");
          if (!response.ok) throw new Error("Failed to fetch shifts");
          const data = await response.json();
          set({ shifts: data.data?.shifts || [] });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Could not load shifts";
          set({ error: errorMessage });
          console.error("Error fetching shifts:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      setError: (error) => set({ error }),
    }),
    { name: "ShiftStore" }
  )
);
