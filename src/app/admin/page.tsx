import type { Metadata } from "next";
import { AdminJournal } from "./AdminJournal";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const projects = (await getProjects()).map((p) => ({ slug: p.slug, title: p.title }));
  return (
    <div className="frame pt-10">
      <AdminJournal projects={projects} />
    </div>
  );
}
