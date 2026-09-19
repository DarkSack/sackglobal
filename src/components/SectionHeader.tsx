import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./icons";

interface Props {
  index: string;
  label: string;
  /** Título grande. Cada línea es un elemento: la composición se decide aquí. */
  title: string[];
  intro?: ReactNode;
  action?: { href: string; label: string };
  id?: string;
}

/**
 * Cabecera de sección: número + etiqueta en mono, titular condensado
 * enorme y, a la derecha, una entradilla corta. Es la columna vertebral
 * de la composición de cada página.
 */
export function SectionHeader({ index, label, title, intro, action, id }: Props) {
  return (
    <header className="grid grid-cols-12 gap-x-4 gap-y-6 border-t border-line pt-5 md:gap-x-8">
      <p className="meta col-span-12 flex items-baseline gap-3 md:col-span-3">
        <span className="text-accent">{index}</span>
        <span aria-hidden="true">/</span>
        <span>{label}</span>
      </p>
      <h2 id={id} className="display col-span-12 text-[clamp(3rem,11vw,9.5rem)] md:col-span-9">
        {title.map((line, i) => (
          <span key={line} className={i % 2 === 1 ? "block pl-[0.6em] text-muted" : "block"}>
            {line}
          </span>
        ))}
      </h2>
      {(intro || action) && (
        <div className="col-span-12 flex flex-col gap-5 md:col-span-6 md:col-start-4 lg:col-span-5 lg:col-start-4">
          {intro && <div className="text-lg leading-relaxed text-muted">{intro}</div>}
          {action && (
            <Link href={action.href} className="meta link inline-flex w-fit items-center gap-2 text-fg">
              {action.label} <ArrowRight />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
