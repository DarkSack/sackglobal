import { getProject } from "@/lib/projects";
import { CATEGORY_LABEL } from "@/lib/projects/classify";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Proyecto de Sack";

const ACCENT_HEX = { ruby: "#e0506a", cobalt: "#6a88ff", amber: "#e6a93f", sage: "#86b995", violet: "#a48bf2", neutral: "#e0506a" };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  if (!project) return ogCard({ kicker: "Project", title: "Not found", footer: "sack" });
  return ogCard({
    kicker: `Project / ${CATEGORY_LABEL[project.category]}`,
    title: project.title,
    subtitle: project.tagline ?? project.description,
    footer: project.tech
      .slice(0, 4)
      .map((t) => t.name)
      .join(" · "),
    accent: ACCENT_HEX[project.accent],
  });
}
