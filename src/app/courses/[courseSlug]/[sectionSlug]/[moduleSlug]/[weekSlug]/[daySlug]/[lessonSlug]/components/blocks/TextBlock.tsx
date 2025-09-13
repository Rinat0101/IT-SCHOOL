// components/blocks/TextBlock.tsx
import Markdown from "../MarkdownRenderer";

interface TextBlockProps {
  id?: string;
  title?: string | null;
  content: string;
  subsections?:
    | {
        id: string;
        title?: string | null;
        text?: string | null;
      }[]
    | null;
}

export default function TextBlock({ id, title, content, subsections }: TextBlockProps) {
  return (
    <div className="mb-6">
      {title && (
        <h2 id={`sec-${id}`} className="text-xl font-semibold text-[#202733] mb-2">
          {title}
        </h2>
      )}

      {/* Main content */}
      <Markdown content={content} />

      {/* Subsections: title + text (markdown) */}
      {Array.isArray(subsections) && subsections.length > 0 && (
        <div className="mt-4 space-y-3">
          {subsections.map((sub) => {
            const hasTitle = !!sub.title && sub.title.trim().length > 0;
            const hasText = !!sub.text && sub.text.trim().length > 0;
            if (!hasTitle && !hasText) return null;

            return (
              <div key={sub.id}>
                {hasTitle && (
                  <h3
                    id={`sub-${sub.id}`}
                    className="text-lg font-semibold text-[#212B36] mt-3 mb-1"
                  >
                    {sub.title}
                  </h3>
                )}
                {hasText && <Markdown content={sub.text!} className="mt-1" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
