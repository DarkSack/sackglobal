import { useEffect, useState } from "react";
import { Share2, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createLink, deleteLink, listLinks } from "@/api/socialLinks";

const ADMIN_EMAIL = "johanjafet4@gmail.com";

export default function SocialLinks() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [channel, setChannel] = useState("");
  const [iconify, setIconify] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setLinks(await listLinks());
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !isAdmin) return;
    setPosting(true);
    try {
      await createLink({
        name: name.trim(),
        url: url.trim(),
        channelName: channel.trim() || null,
        iconifyName: iconify.trim() || null,
      });
      setName("");
      setUrl("");
      setChannel("");
      setIconify("");
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Borrar este enlace?")) return;
    try {
      await deleteLink(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-center gap-3 mb-6">
        <Share2 size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Redes sociales</h1>
          <p className="text-sm text-muted-foreground">
            Todos mis perfiles publicos en un solo lugar.
          </p>
        </div>
      </header>

      {isAdmin && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 p-4 rounded-xl border border-border bg-card"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej. Twitch)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="Canal / handle (ej. sackanomalo)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL"
            className="sm:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={iconify}
            onChange={(e) => setIconify(e.target.value)}
            placeholder="Iconify (ej. logos:twitch)"
            className="sm:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={posting || !name.trim() || !url.trim()}
            className="sm:col-span-2 justify-self-end px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {posting ? "Guardando…" : "Anadir enlace"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Cargando…
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aun no hay enlaces.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
            >
              {l.iconify_name && (
                <img
                  src={`https://api.iconify.design/${l.iconify_name}.svg`}
                  alt=""
                  className="h-8 w-8"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{l.name}</div>
                {l.channel_name && (
                  <div className="text-xs text-muted-foreground truncate">
                    {l.channel_name}
                  </div>
                )}
              </div>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded text-muted-foreground hover:text-primary hover:bg-accent transition"
              >
                <ExternalLink size={16} />
              </a>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => remove(l.id)}
                  className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition"
                  title="Borrar"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
