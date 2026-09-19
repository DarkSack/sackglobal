import type { Metadata } from "next";
import { Suspense } from "react";
import { JournalEmpty } from "@/components/JournalCard";
import { JournalIndex } from "@/components/JournalFeed";
import { SectionHeader } from "@/components/SectionHeader";
import { getJournal } from "@/lib/journal/service";
import { getProjects } from "@/lib/projects";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Journal",
  description: "Field notes: devlogs, lanzamientos, tutoriales y notas de trabajo de Sack.",
  alternates: { canonical: "/journal", types: { "application/rss+xml": "/journal/rss.xml" } },
};

export default async function JournalPage() {
  const [{ posts, available }, projects] = await Promise.all([getJournal(), getProjects()]);
  const projectTitles = Object.fromEntries(projects.map((p) => [p.slug, p.title]));

  return (
    <div className="frame pt-10">
      <SectionHeader
        index="03"
        label="Journal"
        title={["Field", "Notes"]}
        intro={
          <>
            Devlogs, lanzamientos y notas de lo que construyo. También por{" "}
            <a href="/journal/rss.xml" className="link text-fg">
              RSS
            </a>
            .
          </>
        }
      />
      <div className="mt-14">
        {posts.length ? (
          <Suspense>
            <JournalIndex posts={posts} projectTitles={projectTitles} />
          </Suspense>
        ) : (
          <JournalEmpty available={available} />
        )}
      </div>
    </div>
  );
}
