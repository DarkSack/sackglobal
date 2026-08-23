import { useState, type ReactNode } from "react";
import { User, Mail, Github, LogOut, UserPlus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/lib/notify";

export default function Profile() {
  const { user, isLogged, signInWithGitHub, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await signInWithGitHub();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo iniciar el login con GitHub.");
      setLoggingIn(false);
    }
  };

  const handleSwitchAccount = () => {
    if (loggingIn) return;
    window.open("https://github.com/logout", "_blank", "noopener,noreferrer");
    toast.info(
      "Cierra sesion en la pestana de GitHub y vuelve aca a pulsar 'Entrar con GitHub'.",
      { duration: 6000 }
    );
  };

  if (!isLogged || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <User size={40} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Perfil</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Inicia sesion con GitHub para ver tu perfil.
        </p>
        <div className="inline-flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void handleLogin()}
            disabled={loggingIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-70 disabled:cursor-wait transition"
          >
            {loggingIn ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Github size={16} />
            )}
            {loggingIn ? "Redirigiendo…" : "Entrar con GitHub"}
          </button>
          <button
            type="button"
            onClick={handleSwitchAccount}
            disabled={loggingIn}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition"
          >
            <UserPlus size={12} /> Usar otra cuenta de GitHub
          </button>
        </div>
      </div>
    );
  }

  const meta = (user.user_metadata || {}) as Record<string, string | undefined>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-border bg-card">
        {meta.avatar_url ? (
          <img
            src={meta.avatar_url}
            alt="avatar"
            className="h-28 w-28 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="h-28 w-28 rounded-full bg-accent grid place-items-center text-4xl">
            👤
          </div>
        )}
        <h1 className="text-2xl font-bold">
          {meta.name || meta.user_name || "Sin nombre"}
        </h1>
        {meta.user_name && (
          <a
            href={`https://github.com/${meta.user_name}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary text-sm"
          >
            <Github size={14} /> @{meta.user_name}
          </a>
        )}

        <div className="w-full mt-4 grid gap-3 text-sm">
          <Row icon={<Mail size={16} />} label="Email" value={user.email || ""} />
          <Row icon={<User size={16} />} label="ID" value={user.id} />
        </div>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            toast.info("Sesión cerrada.");
            navigate("/");
          }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-muted-foreground hover:text-destructive hover:bg-accent transition"
        >
          <LogOut size={14} /> Cerrar sesion
        </button>
      </div>
    </div>
  );
}

interface RowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function Row({ icon, label, value }: RowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-md bg-background">
      <span className="text-primary">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm truncate">{value}</div>
      </div>
    </div>
  );
}
