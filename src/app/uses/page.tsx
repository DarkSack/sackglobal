import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { uses } from "@/content/uses";

export const metadata: Metadata = {
  title: "Uses",
  description: "Herramientas, plataformas y stack que usa Sack, con la fuente de cada dato.",
  alternates: { canonical: "/uses" },
};

const DEV = process.env.NODE_ENV === "development";

export default function UsesPage() {
  const groups = uses
    .map((g) => ({ ...g, items: g.items.filter((i) => DEV || !i.pending) }))
    .filter((g) => g.items.length);

  return (
    <div className="frame pt-10">
      <SectionHeader
        index="—"
        label="Uses"
        title={["Tools", "Of the trade"]}
        intro="Lo que uso para construir. Cada entrada cita el repositorio que la respalda."
      />
      <div className="mt-16">
        {groups.map((g, gi) => (
          <section key={g.id} className="grid grid-cols-12 gap-x-3 md:gap-x-8 border-t border-line py-8" aria-labelledby={`uses-${g.id}`}>
            <h2 id={`uses-${g.id}`} className="col-span-12 mb-4 flex items-baseline gap-3 md:col-span-3 md:mb-0">
              <span className="meta text-accent">{String(gi + 1).padStart(2, "0")}</span>
              <span className="display text-3xl">{g.label}</span>
            </h2>
            <ul className="col-span-12 md:col-span-9">
              {g.items.map((item) => (
                <li
                  key={item.name}
                  className={
                    item.pending
                      ? "mb-2 grid grid-cols-9 gap-x-6 border border-dashed border-accent/60 p-3"
                      : "grid grid-cols-9 gap-x-6 border-b border-line py-3 last:border-0"
                  }
                >
                  <span className="col-span-9 font-medium sm:col-span-3">{item.name}</span>
                  <span className="col-span-9 text-muted sm:col-span-4">{item.detail}</span>
                  <span className="meta col-span-9 text-faint normal-case tracking-normal sm:col-span-2 sm:text-right">
                    {item.pending ? <span className="text-accent">pendiente · solo en dev</span> : item.source}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
