import { Link } from "react-router-dom";
import { FileText, Newspaper, Share2, ArrowRight, Users } from "lucide-react";

const cards = [
  {
    to: "/social/posts",
    icon: FileText,
    title: "Posts",
    desc: "Publico ideas, apuntes o novedades del stream.",
  },
  {
    to: "/social/noticias",
    icon: Newspaper,
    title: "Noticias",
    desc: "Comparto noticias relevantes con la comunidad.",
  },
  {
    to: "/social/redes-sociales",
    icon: Share2,
    title: "Redes sociales",
    desc: "Enlaces directos a mis perfiles publicos.",
  },
];

export default function SocialHome() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex items-center gap-3 mb-8">
        <Users size={30} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Social</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todo lo que no es codigo pero acompana al proyecto.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col gap-2 p-6 rounded-xl border border-border bg-card hover:-translate-y-1 hover:border-primary hover:shadow-[0_10px_24px_rgba(74,163,255,0.12)] transition"
          >
            <Icon size={28} className="text-primary" />
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Entrar
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
