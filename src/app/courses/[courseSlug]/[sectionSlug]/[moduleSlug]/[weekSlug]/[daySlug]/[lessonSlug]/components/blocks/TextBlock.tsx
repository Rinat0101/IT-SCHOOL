// components/blocks/TextBlock.tsx
import Markdown from "../MarkdownRenderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      {/* Section Title */}
      {title && (
        <h2 id={`sec-${id}`} className="text-xl font-semibold text-[#202733] mb-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ children }) => (
                <code className="px-1 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[0.9em]">
                  {children}
                </code>
              ),
            }}
          >
            {title}
          </ReactMarkdown>
        </h2>
      )}

      {/* Main content */}
      <Markdown content={content} />

      {/* Subsections */}
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
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ children }) => (
                          <code className="px-1 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[0.9em]">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {sub.title}
                    </ReactMarkdown>
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