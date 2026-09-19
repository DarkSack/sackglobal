import { profile } from "@/content/profile";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Sack — Engineer, Builder, Experimenter";

export default function Image() {
  return ogCard({
    kicker: "Digital archive",
    title: "Sack",
    subtitle: profile.statement,
    footer: profile.roles.join(" · "),
  });
}
