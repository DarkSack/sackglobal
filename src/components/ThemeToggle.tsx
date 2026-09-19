"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

/** Script que fija el tema antes del primer pintado (sin parpadeo). */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Sin almacenamiento el cambio dura lo que la pestaña. Suficiente.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="meta flex h-9 items-center gap-2 px-2 text-muted hover:text-fg"
      aria-label={`Cambiar a tema ${next === "light" ? "claro" : "oscuro"}`}
    >
      <span aria-hidden="true" className="relative inline-block size-3 overflow-hidden rounded-full border border-current">
        <span className="absolute inset-y-0 left-0 w-1/2 bg-current" />
      </span>
      <span className="hidden lg:inline">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
