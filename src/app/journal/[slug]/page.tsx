import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { Markdown } from "@/components/Markdown";
import { getJournal, getPost } from "@/lib/journal/service";
import { POST_TYPE_LABEL } from "@/lib/journal/types";
import { getProject } from "@/lib/projects";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getJournal()).posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/journal/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const project = post.project ? await getProject(post.project) : null;
  const { posts } = await getJournal();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const older = posts[index + 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
    keywords: post.tags.join(", "),
  };

  return (
    <article className="frame pb-10 pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-6 border-t border-line pt-5">
        <p className="meta col-span-12 flex flex-wrap gap-x-3 md:col-span-3">
          <span className="text-accent">[ {POST_TYPE_LABEL[post.type]} ]</span>
          {project && (
            <Link href={`/projects/${project.slug}`} className="link">
              / {project.title}
            </Link>
          )}
        </p>
        <h1 className="display col-span-12 text-[clamp(3rem,8vw,7.5rem)] md:col-span-9">{post.title}</h1>
        <dl className="meta col-span-12 grid grid-cols-3 gap-4 md:col-span-3 md:grid-cols-1 md:self-start">
          <div>
            <dt className="text-faint">Published</dt>
            <dd className="text-fg">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </dd>
          </div>
          <div>
            <dt className="text-faint">Reading</dt>
            <dd className="text-fg">{post.readingMinutes} min</dd>
          </div>
          <div>
            <dt className="text-faint">Author</dt>
            <dd className="text-fg">{post.author}</dd>
          </div>
        </dl>
        <p className="col-span-12 text-[clamp(1.25rem,2vw,1.6rem)] leading-snug text-muted md:col-span-7 md:col-start-4">{post.excerpt}</p>
      </header>

      {post.coverImage && (
        // Portada subida desde el CMS; dominio arbitrario.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className="mt-12 aspect-[21/9] w-full border border-line object-cover" />
      )}

      <div className="mt-14 grid grid-cols-12 gap-x-3 md:gap-x-8">
        <Markdown className="col-span-12 md:col-span-8 md:col-start-4">{post.content}</Markdown>
      </div>

      {post.tags.length > 0 && (
        <p className="meta mt-14 flex flex-wrap gap-3 md:ml-[25%]">
          {post.tags.map((t) => (
            <Link key={t} href={`/journal?tag=${encodeURIComponent(t)}`} className="link">
              #{t}
            </Link>
          ))}
        </p>
      )}

      {older && (
        <Link href={`/journal/${older.slug}`} className="group mt-24 block border-t border-line pt-4">
          <span className="meta flex items-center gap-2">
            Anterior <ArrowRight />
          </span>
          <span className="display mt-3 block text-[clamp(2.5rem,6vw,5rem)] text-muted group-hover:text-fg">{older.title}</span>
        </Link>
      )}
    </article>
  );
}
