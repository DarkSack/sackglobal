import { siGithub, siKofi, siTwitch, siX } from "simple-icons";
import type { SocialIcon as SocialIconId } from "@/content/social";

const BRAND = { github: siGithub, x: siX, twitch: siTwitch, kofi: siKofi } as const;

export function SocialIcon({ id, size = 18 }: { id: SocialIconId; size?: number }) {
  if (id in BRAND) {
    const icon = BRAND[id as keyof typeof BRAND];
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d={icon.path} />
      </svg>
    );
  }
  if (id === "email") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" />
        <path d="m3 6 9 7 9-7" />
      </svg>
    );
  }
  // LinkedIn: sin icono de marca disponible, monograma tipográfico.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="system-ui">
        in
      </text>
    </svg>
  );
}

export function ArrowUpRight({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

export function ArrowRight({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1.5 6h9M7 2.5 10.5 6 7 9.5" />
    </svg>
  );
}
