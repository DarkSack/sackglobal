"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Vista previa del editor. En el sitio público se usa `Markdown` (servidor). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-archive">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
