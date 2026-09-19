import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cx } from "@/lib/format";

/**
 * Markdown renderizado en el servidor: cero JavaScript en el cliente.
 * react-markdown no interpreta HTML crudo, así que un README o un post
 * no pueden inyectar scripts.
 *
 * `repo` reescribe los enlaces e imágenes relativos del README para que
 * apunten a GitHub en lugar de a este sitio.
 */
export function Markdown({
  children,
  repo,
  className,
}: {
  children: string;
  repo?: { owner: string; name: string; branch: string };
  className?: string;
}) {
  const resolve = (url: string | undefined, kind: "link" | "image") => {
    if (!url || !repo || /^(https?:|mailto:|#|data:)/i.test(url)) return url;
    const path = url.replace(/^\.?\//, "");
    return kind === "image"
      ? `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${repo.branch}/${path}`
      : `https://github.com/${repo.owner}/${repo.name}/blob/${repo.branch}/${path}`;
  };

  const components: Components = {
    a: ({ href, children: c }) => {
      const url = resolve(href, "link");
      const external = url && /^https?:/i.test(url);
      return (
        <a href={url} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {c}
        </a>
      );
    },
    img: ({ src, alt }) => (
      // Las imágenes de README tienen tamaños desconocidos; next/image no aporta aquí.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resolve(typeof src === "string" ? src : undefined, "image")} alt={alt ?? ""} loading="lazy" decoding="async" />
    ),
  };

  return (
    <div className={cx("prose-archive", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
