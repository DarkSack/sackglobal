import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearCache } from "@/lib/cache";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isLogged: boolean;
  signInWithGitHub: () => Promise<unknown>;
  signOut: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session || null);
        setUser(data.session?.user || null);
      })
      .finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      setUser(s?.user || null);
      if (s?.user) {
        const meta = (s.user.user_metadata || {}) as Record<string, string>;
        try {
          await supabase.from("users").upsert(
            {
              user_id: s.user.id,
              nickname:
                meta.user_name ||
                meta.nickname ||
                meta.preferred_username ||
                s.user.email,
              email: s.user.email,
              name: meta.name || meta.full_name || null,
              avatar_url: meta.avatar_url || null,
            },
            { onConflict: "user_id" }
          );
        } catch (err) {
          console.warn("upsert user:", (err as Error).message);
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGitHub = () =>
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin + "/" },
    });

  const signOut = async () => {
    // Se vacia la cache al salir: parte de lo cacheado depende de quien
    // esta identificado (por ejemplo las reacciones propias), y dejarlo
    // ahi haria que el siguiente usuario viera restos del anterior.
    clearCache();
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isLogged: Boolean(user),
        signInWithGitHub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
