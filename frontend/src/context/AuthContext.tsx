import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getCurrentUser, loginUser, registerUser, updateProfile } from "../services/authservice";
import type { Profile } from "../types/domain";

interface LocalUser {
  id: string;
  phone: string;
}

interface LocalSession {
  access_token: string;
  user: LocalUser;
}

interface AuthContextValue {
  user: LocalUser | null;
  session: LocalSession | null;
  profile: Profile | null;
  loading: boolean;
  sendVerificationEmail: (phone: string) => Promise<void>;
  signInWithPassword: (phone: string, password: string) => Promise<void>;
  signUpWithPassword: (phone: string, password: string, name?: string, phoneAlt?: string) => Promise<void>;
  upsertProfile: (input: { name: string; phone: string; dob?: string; gender?: string; beautyUse?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionKey = "manis_auth_session";
const profileKey = "manis_auth_profile";
const tokenKey = "manis_auth_token";

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedSession = readJson<LocalSession>(sessionKey);
      const storedProfile = readJson<Profile>(profileKey);

      setSession(storedSession);
      setProfile(storedProfile);

      if (!localStorage.getItem(tokenKey)) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getCurrentUser();
        const nextSession: LocalSession = {
          access_token: localStorage.getItem(tokenKey) ?? "",
          user: { id: userProfile.id, phone: userProfile.phone ?? "" },
        };
        localStorage.setItem(sessionKey, JSON.stringify(nextSession));
        localStorage.setItem(profileKey, JSON.stringify(userProfile));
        setSession(nextSession);
        setProfile(userProfile);
      } catch (err: unknown) {
        // Only clear the session on a genuine 401 (invalid/expired token).
        // For network errors (server cold-starting on Render, timeouts, etc.)
        // we keep the stored session so the user stays logged in.
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(sessionKey);
          localStorage.removeItem(profileKey);
          setSession(null);
          setProfile(null);
        }
        // On network error / 5xx — silently keep existing stored session
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  const persistAuth = (token: string, userProfile: Profile) => {
    const user = { id: userProfile.id, phone: userProfile.phone ?? "" };
    const nextSession = { access_token: token, user };
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(sessionKey, JSON.stringify(nextSession));
    localStorage.setItem(profileKey, JSON.stringify(userProfile));
    setSession(nextSession);
    setProfile(userProfile);
    return nextSession;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      sendVerificationEmail: async () => {
        throw new Error("Phone-based sign in does not use email verification.");
      },
      signInWithPassword: async (phone: string, password: string) => {
        const response = await loginUser({ phone, password });
        persistAuth(response.token, response.user);
      },
      signUpWithPassword: async (phone: string, password: string, name = "Customer") => {
        const response = await registerUser({ phone, password, name });
        persistAuth(response.token, response.user);
      },
      upsertProfile: async ({ name, phone, dob, gender, beautyUse }) => {
        if (!session) throw new Error("Please sign in first.");
        const nextProfile = await updateProfile({ name: name.trim(), phone: phone.trim(), dob, gender, beautyUse });
        localStorage.setItem(profileKey, JSON.stringify(nextProfile));
        setProfile(nextProfile);
      },
      signOut: async () => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(profileKey);
        setSession(null);
        setProfile(null);
      },
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
