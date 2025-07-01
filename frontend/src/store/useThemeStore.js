import { create } from "zustand"

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("site-theme") || "pastel",
  setTheme: (theme) => {
    localStorage.setItem("site-theme", theme);
    set({ theme });
  },
}))