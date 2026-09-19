"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { NAV } from "@/lib/site";
import { cx } from "@/lib/format";
import { SearchTrigger } from "./SearchCommand";
import { ThemeToggle } from "./ThemeToggle";

export function SiteNavbar() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Al navegar se cierra el menú móvil (ajuste durante el render).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenu(false);
  }

  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const isActive = (href: string) =>
    pathname === href || (href === "/work" && pathname.startsWith("/projects")) || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav className="frame flex h-14 items-center justify-between gap-4" aria-label="Principal">
        <Link href="/" className="group flex items-baseline gap-2" aria-label="Sack — inicio">
          <span className="display-wide text-xl tracking-tight">Sack</span>
          <span className="meta hidden text-faint transition-colors group-hover:text-accent sm:inline">
            / digital archive
          </span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cx(
                  "meta flex items-baseline gap-1.5 transition-colors hover:text-fg",
                  isActive(item.href) ? "text-fg" : "text-muted",
                )}
              >
                <span className={isActive(item.href) ? "text-accent" : "text-faint"}>{item.n}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <SearchTrigger />
          <ThemeToggle />
          <button
            type="button"
            className="meta flex h-9 items-center px-2 text-fg md:hidden"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {menu && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col justify-between bg-bg px-4 pb-8 pt-6 md:hidden">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href} className="border-t border-line">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-baseline gap-4 py-3"
                >
                  <span className="meta w-6 text-accent">{item.n}</span>
                  <span className="display text-[clamp(2.75rem,14vw,4rem)]">{item.label}</span>
                </Link>
              </li>
            ))}
            <li className="border-t border-line">
              <Link href="/uses" className="flex items-baseline gap-4 py-3">
                <span className="meta w-6 text-faint">—</span>
                <span className="display text-3xl text-muted">Uses</span>
              </Link>
            </li>
          </ul>
          <p className="meta text-faint">{profile.locationShort}</p>
        </div>
      )}
    </header>
  );
}
