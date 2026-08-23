import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  ChevronDown,
  Github,
  LogIn,
  LogOut,
  User,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/notify";

export default function TopBar() {
  const { user, isLogged, signInWithGitHub, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [socialOpen, setSocialOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const socialRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        socialRef.current &&
        !socialRef.current.contains(e.target as Node)
      ) {
        setSocialOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const socialActive = location.pathname.startsWith("/social");
  const meta = (user?.user_metadata || {}) as Record<string, string | undefined>;

  const handleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await signInWithGitHub();
      // El navegador se redirige a GitHub; si vuelve aca sin redirect es que fallo
    } catch (err) {
      console.error(err);
      toast.error("No se pudo iniciar el login con GitHub.");
      setLoggingIn(false);
    }
  };

  const handleSwitchAccount = () => {
    if (loggingIn) return;
    // Abrir la pagina de logout de GitHub en otra pestana
    window.open("https://github.com/logout", "_blank", "noopener,noreferrer");
    toast.info(
      "Cierra sesion en la pestana de GitHub y vuelve aca a pulsar 'Entrar con GitHub'.",
      { duration: 6000 }
    );
  };

  const handleLogout = async () => {
    await signOut();
    toast.info("Sesión cerrada.");
    navigate("/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition"
        >
          <img
            src="/logo.png"
            alt="SackGlobal"
            className="h-9 w-9 rounded-md object-contain"
          />
          <span>SackGlobal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavItem to="/" icon={<Home size={16} />} label="Portfolio" end />

          <div className="relative" ref={socialRef}>
            <button
              type="button"
              onClick={() => setSocialOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition",
                socialActive && "text-primary bg-accent"
              )}
            >
              <Users size={16} /> Social <ChevronDown size={14} />
            </button>
            {socialOpen && (
              <div className="absolute top-full left-0 mt-2 min-w-[220px] rounded-lg border border-border bg-card shadow-xl p-1">
                <MenuItem
                  to="/social"
                  label="Inicio social"
                  end
                  onClick={() => setSocialOpen(false)}
                />
                <MenuItem
                  to="/social/posts"
                  label="Posts"
                  onClick={() => setSocialOpen(false)}
                />
                <MenuItem
                  to="/social/noticias"
                  label="Noticias"
                  onClick={() => setSocialOpen(false)}
                />
                <MenuItem
                  to="/social/redes-sociales"
                  label="Redes sociales"
                  onClick={() => setSocialOpen(false)}
                />
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2">
          {isLogged ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full bg-secondary hover:bg-accent transition py-1 pl-1 pr-3"
              >
                {meta.avatar_url ? (
                  <img
                    src={meta.avatar_url}
                    alt="avatar"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {meta.user_name || meta.name || "Perfil"}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesion"
                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="inline-flex rounded-md overflow-hidden border border-primary/60">
              <button
                type="button"
                onClick={() => void handleLogin()}
                disabled={loggingIn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-70 disabled:cursor-wait transition"
              >
                {loggingIn ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Github size={16} />
                )}
                <span className="hidden sm:inline">
                  {loggingIn ? "Redirigiendo…" : "Entrar con GitHub"}
                </span>
                <span className="sm:hidden">
                  {loggingIn ? null : <LogIn size={16} />}
                </span>
              </button>
              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={loggingIn}
                title="Usar otra cuenta de GitHub"
                aria-label="Usar otra cuenta de GitHub"
                className="inline-flex items-center px-2.5 bg-primary/80 text-primary-foreground border-l border-primary-foreground/20 hover:bg-primary/95 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                <UserPlus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition",
          isActive && "text-primary bg-accent"
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

interface MenuItemProps {
  to: string;
  label: string;
  end?: boolean;
  onClick?: () => void;
}

function MenuItem({ to, label, end, onClick }: MenuItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition",
          isActive && "text-primary bg-accent"
        )
      }
    >
      {label}
    </NavLink>
  );
}
