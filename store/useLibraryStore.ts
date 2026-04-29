'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Library, Floor, Shift, LibraryFormState, LibrarySetupPayload } from '@/lib/validations';

type LibrarywithDetails = Library & {
  floors: Floor[];
  shifts: Shift[];
};

interface UnifiedLibraryStore {
  data: LibrarywithDetails | null;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  isSetupComplete: () => boolean;
  setupLibrary: (payload: LibrarySetupPayload) => Promise<void>;
  fetchAll: () => Promise<void>;
  updateLibraryInfo: (updates: Partial<LibraryFormState>) => Promise<void>;
  syncFloors: (libraryId: string, floors: Floor[]) => Promise<void>;
  syncShifts: (shiftId: string, updates: Omit<Shift, 'id'>[]) => Promise<void>;
}

export const useLibraryStore = create<UnifiedLibraryStore>()(
  devtools((set, get) => ({
    data: null,
    isLoading: false,
    error: null,

    setError: (error) => set({ error }),
    
    isSetupComplete: () => {
      const current = get().data;
      return !!current && !!current.name && !!current.email;
    },
    
    // Setup library with basic details, floors and shifts in one go
    setupLibrary: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to set up library');
        const data = await response.json();

        set({ data: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    // get all library details including floors and shifts
    fetchAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library');
        if (!response.ok) throw new Error('Failed to fetch library');
        const data = await response.json();
        set({ data: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    // update library basic details and facilities
    updateLibraryInfo: async (updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update library');
        const data = await response.json();
        set({ data: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    // create, update, delete floor details 
    syncFloors: async (libraryId, floors) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library/floors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ libraryId, floors }),
        });
        
        if (!response.ok) throw new Error('Failed to sync floors');
        
        await get().fetchAll();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    // update shift details like timings, price and active status
    syncShifts: async (libraryId, shifts) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library/shifts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ libraryId, shifts }),
        });
        
        if (!response.ok) throw new Error('Failed to sync shifts');
        
        await get().fetchAll();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  }))
);
