import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const meta = s.user.user_metadata || {};
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
          console.warn("upsert user:", err.message);
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

  const signOut = () => supabase.auth.signOut();

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

export const useAuth = () => useContext(AuthContext);
