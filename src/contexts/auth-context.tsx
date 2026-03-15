"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth/client";
import { useAppStore } from "@/stores/app-store";
import { SYNC_STALE_THRESHOLD_MS } from "@/lib/constants";

type AuthContextValue = {
  user: { id: string; email: string; name?: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser, syncFromDatabase, lastSyncedAt, clearStore } =
    useAppStore();

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const { data } = await res.json();
        setStoreUser(data);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, [setStoreUser]);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name,
        });
      } else {
        setUser(null);
        setStoreUser(null);
      }
    } catch {
      setUser(null);
      setStoreUser(null);
    }
  }, [setStoreUser]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    clearStore();
  }, [clearStore]);

  useEffect(() => {
    async function init() {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const u = {
            id: session.data.user.id,
            email: session.data.user.email,
            name: session.data.user.name,
          };
          setUser(u);

          // Fetch profile
          await refreshProfile();

          // Sync if stale
          const now = Date.now();
          if (
            !lastSyncedAt ||
            now - lastSyncedAt > SYNC_STALE_THRESHOLD_MS
          ) {
            syncFromDatabase(u.id);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, refreshSession, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
