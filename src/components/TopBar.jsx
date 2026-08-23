import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  ChevronDown,
  Github,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { user, isLogged, signInWithGitHub, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [socialOpen, setSocialOpen] = useState(false);
  const socialRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (socialRef.current && !socialRef.current.contains(e.target)) {
        setSocialOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const socialActive = location.pathname.startsWith("/social");

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition"
        >
          <span className="grid place-items-center h-8 w-8 rounded-md bg-primary text-primary-foreground text-sm">
            S
          </span>
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
                <MenuItem to="/social" label="Inicio social" onClick={() => setSocialOpen(false)} />
                <MenuItem to="/social/posts" label="Posts" onClick={() => setSocialOpen(false)} />
                <MenuItem to="/social/noticias" label="Noticias" onClick={() => setSocialOpen(false)} />
                <MenuItem to="/social/redes-sociales" label="Redes sociales" onClick={() => setSocialOpen(false)} />
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
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user?.user_metadata?.user_name ||
                    user?.user_metadata?.name ||
                    "Perfil"}
                </span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                title="Cerrar sesion"
                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={signInWithGitHub}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
            >
              <Github size={16} />
              <span className="hidden sm:inline">Entrar con GitHub</span>
              <span className="sm:hidden">
                <LogIn size={16} />
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, icon, label, end }) {
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

function MenuItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
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
