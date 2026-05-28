"use client";

import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "./supabase";

type Status = "loading" | "signed_in" | "signed_out";

type AuthStore = {
  status: Status;
  email: string | null;
  setSession: (email: string | null) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthStore>((set) => ({
  // Local mode (no Supabase) → always "signed_in" so the gate is transparent.
  status: isSupabaseConfigured ? "loading" : "signed_in",
  email: null,

  setSession: (email) => set({ email, status: email ? "signed_in" : "signed_out" }),

  signIn: async (email, password) => {
    if (!supabase) return null;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ email: null, status: "signed_out" });
  },
}));
