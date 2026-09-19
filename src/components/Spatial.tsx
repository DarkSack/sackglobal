"use client";

import { useRef, type ReactNode } from "react";

/**
 * Profundidad mínima: las capas marcadas con `data-depth` se desplazan
 * unos píxeles según la posición del ratón. Sin librerías y sin nada
 * en táctil o con movimiento reducido.
 */
export function Spatial({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const d = Number(layer.dataset.depth) || 0;
        layer.style.transform = `translate3d(${x * d}px, ${y * d}px, 0)`;
      });
    });
  }

  function leave() {
    cancelAnimationFrame(frame.current);
    ref.current?.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
      layer.style.transform = "";
    });
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={className}>
      {children}
    </div>
  );
}
