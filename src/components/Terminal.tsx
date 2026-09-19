import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export interface TerminalLine {
  key: string;
  value: ReactNode;
}

/**
 * La terminal como elemento de identidad, no como estética de todo el
 * sitio: un comando y su salida, con datos que vienen de las fuentes.
 */
export function Terminal({
  command,
  lines,
  className,
  footer,
}: {
  command: string;
  lines: TerminalLine[];
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <figure className={cx("border border-line bg-sunken font-mono text-[12px] leading-relaxed", className)}>
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </span>
        <span className="text-[10px] uppercase tracking-widest text-faint">tty / sack</span>
      </div>
      <div className="px-4 py-4">
        <p>
          <span className="text-accent">$</span> <span className="text-fg">{command}</span>
        </p>
        <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1">
          {lines.map((l) => (
            <div key={l.key} className="contents">
              <dt className="uppercase tracking-wider text-faint">{l.key}</dt>
              <dd className="text-fg">{l.value}</dd>
            </div>
          ))}
        </dl>
        {footer && <div className="mt-3 text-muted">{footer}</div>}
        <p className="caret mt-3 text-accent" aria-hidden="true">
          $
        </p>
      </div>
    </figure>
  );
}
