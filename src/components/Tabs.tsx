import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabDef<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  /** Contador opcional a la derecha del texto. */
  badge?: number;
}

interface TabsProps<T extends string> {
  tabs: readonly TabDef<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Etiqueta accesible de la barra. */
  label: string;
}

/**
 * Barra de pestañas.
 *
 * Implementa el patrón ARIA completo, no solo el aspecto: `tablist` /
 * `tab` / `tabpanel`, `aria-selected`, y navegación con flechas, Inicio
 * y Fin. Solo la pestaña activa entra en el orden de tabulación
 * (`tabIndex -1` en el resto), que es lo que espera un lector de
 * pantalla: Tab entra y sale del grupo, las flechas se mueven dentro.
 *
 * Cambiar de pestaña no navega ni desmonta nada: quien lo usa decide
 * qué panel pinta.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: TabsProps<T>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (delta: number) => {
    const index = tabs.findIndex((t) => t.id === value);
    if (index < 0) return;
    // Se envuelve por los extremos: desde la última, la derecha vuelve
    // a la primera.
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (!next) return;
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  const jump = (position: "first" | "last") => {
    const next = position === "first" ? tabs[0] : tabs[tabs.length - 1];
    if (!next) return;
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex items-center gap-1 overflow-x-auto border-b border-border"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        } else if (e.key === "Home") {
          e.preventDefault();
          jump("first");
        } else if (e.key === "End") {
          e.preventDefault();
          jump("last");
        }
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm transition",
              active
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                  active
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {tab.badge}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition",
                active ? "bg-primary" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Panel asociado a una pestaña. Oculto no significa desmontado. */
export function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!active}
      // `tabIndex 0` porque el panel puede desplazarse: sin esto, un
      // usuario de teclado no podria hacer scroll dentro de el.
      tabIndex={active ? 0 : -1}
      className="pt-6 focus:outline-none"
    >
      {active ? children : null}
    </div>
  );
}
