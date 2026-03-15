import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  CalendarProject,
  CalendarProjectWithPages,
  CalendarPage,
  CalendarTemplate,
  PrintOrder,
} from "@/types";

type AppState = {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Calendar Projects
  projects: CalendarProject[];
  currentProject: CalendarProjectWithPages | null;
  setProjects: (projects: CalendarProject[]) => void;
  setCurrentProject: (project: CalendarProjectWithPages | null) => void;
  addProject: (project: CalendarProject) => void;
  updateProject: (id: string, data: Partial<CalendarProject>) => void;
  removeProject: (id: string) => void;

  // Pages (for current project)
  updatePage: (pageId: string, data: Partial<CalendarPage>) => void;

  // Templates
  templates: CalendarTemplate[];
  setTemplates: (templates: CalendarTemplate[]) => void;

  // Orders
  orders: PrintOrder[];
  setOrders: (orders: PrintOrder[]) => void;
  addOrder: (order: PrintOrder) => void;
  updateOrder: (id: string, data: Partial<PrintOrder>) => void;

  // UI State
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  lastSyncedAt: number | null;
  syncInProgress: boolean;

  // Sync
  syncFromDatabase: (userId: string) => Promise<void>;

  // Reset
  clearStore: () => void;
};

const initialState = {
  user: null,
  projects: [],
  currentProject: null,
  templates: [],
  orders: [],
  isGenerating: false,
  lastSyncedAt: null,
  syncInProgress: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) =>
        set((s) => ({ projects: [project, ...s.projects] })),
      updateProject: (id, data) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
          currentProject:
            s.currentProject?.id === id
              ? { ...s.currentProject, ...data }
              : s.currentProject,
        })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentProject:
            s.currentProject?.id === id ? null : s.currentProject,
        })),

      updatePage: (pageId, data) =>
        set((s) => {
          if (!s.currentProject) return s;
          return {
            currentProject: {
              ...s.currentProject,
              pages: s.currentProject.pages.map((p) =>
                p.id === pageId ? { ...p, ...data } : p
              ),
            },
          };
        }),

      setTemplates: (templates) => set({ templates }),

      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateOrder: (id, data) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
        })),

      setIsGenerating: (v) => set({ isGenerating: v }),

      syncFromDatabase: async (userId: string) => {
        if (get().syncInProgress) return;
        set({ syncInProgress: true });

        try {
          const [profileRes, projectsRes, ordersRes, templatesRes] =
            await Promise.all([
              fetch("/api/profile"),
              fetch("/api/calendars?limit=200"),
              fetch("/api/orders?limit=200"),
              fetch("/api/templates"),
            ]);

          if (profileRes.ok) {
            const { data } = await profileRes.json();
            set({ user: data });
          }

          if (projectsRes.ok) {
            const { data } = await projectsRes.json();
            set({ projects: data.items });
          }

          if (ordersRes.ok) {
            const { data } = await ordersRes.json();
            set({ orders: data.items });
          }

          if (templatesRes.ok) {
            const { data } = await templatesRes.json();
            set({ templates: data });
          }

          set({ lastSyncedAt: Date.now() });
        } finally {
          set({ syncInProgress: false });
        }
      },

      clearStore: () => set(initialState),
    }),
    {
      name: "calfolio-store",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
