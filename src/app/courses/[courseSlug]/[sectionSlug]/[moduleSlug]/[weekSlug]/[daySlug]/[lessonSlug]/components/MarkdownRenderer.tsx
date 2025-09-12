// components/MarkdownRenderer.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type Props = {
  content: string;
  className?: string;
};

// Parses alt like: "My caption | align:right w:300 h:180"
function parseAltWithOptions(rawAlt?: string) {
  const alt = (rawAlt ?? "").trim();
  if (!alt) return { caption: "", align: "", width: undefined as number | undefined, height: undefined as number | undefined };

  const [maybeCaption, maybeOpts] = alt.split("|").map((s) => s.trim());

  let caption = maybeCaption || "";
  let align = "";
  let width: number | undefined;
  let height: number | undefined;

  if (maybeOpts) {
    // options are space-separated: align:right w:300 h:200
    const parts = maybeOpts.split(/\s+/);
    for (const p of parts) {
      if (/^align:(left|right|center)$/i.test(p)) {
        align = p.split(":")[1].toLowerCase();
      } else if (/^w:\d+$/i.test(p)) {
        width = parseInt(p.split(":")[1], 10);
      } else if (/^h:\d+$/i.test(p)) {
        height = parseInt(p.split(":")[1], 10);
      }
    }
  }

  return { caption, align, width, height };
}

export default function MarkdownRenderer({ content, className = "" }: Props) {
  return (
    <div className={`markdown-wrapper ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Allow inline HTML in markdown; keep only if you trust the source.
        rehypePlugins={[rehypeRaw]}
        components={{
          // HEADINGS
          h1: (props) => (
            <h1 {...props} className="text-3xl font-bold text-[#212B36] mt-6 mb-4" />
          ),
          h2: (props) => (
            <h2 {...props} className="text-2xl font-semibold text-[#212B36] mt-6 mb-3" />
          ),
          h3: (props) => (
            <h3 {...props} className="text-xl font-semibold text-[#212B36] mt-5 mb-2" />
          ),
          h4: (props) => (
            <h4 {...props} className="text-lg font-semibold text-[#212B36] mt-4 mb-2" />
          ),

          // PARAGRAPHS
          p: (props) => (
            <p
              {...props}
              className="text-[15px] leading-7 text-[#1B2633] mb-4 whitespace-pre-line"
            />
          ),

          // EMPHASIS / STRONG
          em: (props) => <em {...props} className="italic" />,
          strong: (props) => <strong {...props} className="font-semibold" />,

          // LISTS
          ul: (props) => (
            <ul {...props} className="list-disc pl-6 space-y-2 mb-4 text-[#1B2633]" />
          ),
          ol: (props) => (
            <ol {...props} className="list-decimal pl-6 space-y-2 mb-4 text-[#1B2633]" />
          ),
          li: (props) => <li {...props} className="leading-7" />,

          // QUOTES
          blockquote: (props) => (
            <blockquote
              {...props}
              className="border-l-4 border-gray-200 pl-4 py-2 mb-4 text-[#454F5B] bg-gray-50 rounded"
            />
          ),

          // LINKS
          a: (props) => (
            <a
              {...props}
              className="text-[#B923AE] hover:underline break-words"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),

          // IMAGES with alt options
          img: (props) => {
            // eslint-disable-next-line @next/next/no-img-element
            const { caption, align, width, height } = parseAltWithOptions(props.alt);

            // Float right = text wraps around the image (good for your “image on right of text” need)
            if (align === "right") {
              return (
                <figure className="my-2">
                  <img
                    {...props}
                    alt={caption || props.alt || ""}
                    className="float-right ml-4 mb-2 rounded-md shadow-sm"
                    style={{
                      width: width ? `${width}px` : undefined,
                      height: height ? `${height}px` : undefined,
                    }}
                  />
                  {caption ? (
                    <figcaption className="clear-both text-xs text-[#6B778C] mt-2">
                      {caption}
                    </figcaption>
                  ) : (
                    <div className="clear-both" />
                  )}
                </figure>
              );
            }

            // Centered image
            if (align === "center") {
              return (
                <figure className="my-4 flex flex-col items-center">
                  <img
                    {...props}
                    alt={caption || props.alt || ""}
                    className="rounded-md shadow-sm"
                    style={{
                      width: width ? `${width}px` : undefined,
                      height: height ? `${height}px` : undefined,
                    }}
                  />
                  {caption ? (
                    <figcaption className="text-xs text-[#6B778C] mt-2">{caption}</figcaption>
                  ) : null}
                </figure>
              );
            }

            // Default (left)
            return (
              <figure className="my-3">
                <img
                  {...props}
                  alt={caption || props.alt || ""}
                  className="max-w-full h-auto rounded-md"
                  style={{
                    width: width ? `${width}px` : undefined,
                    height: height ? `${height}px` : undefined,
                  }}
                />
                {caption ? (
                  <figcaption className="text-xs text-[#6B778C] mt-2">{caption}</figcaption>
                ) : null}
              </figure>
            );
          },

          // HORIZONTAL RULE
          hr: (props) => <hr {...props} className="my-6 border-gray-200" />,

          // TABLES
          table: (props) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full border border-gray-200" />
            </div>
          ),
          th: (props) => (
            <th
              {...props}
              className="text-left px-3 py-2 bg-gray-50 border-b border-gray-200 font-semibold"
            />
          ),
          td: (props) => (
            <td {...props} className="px-3 py-2 border-b border-gray-100" />
          ),

          // CODE (inline + fenced)
          // NOTE: use `any` here to avoid TS error about `inline`
          code({ inline, className, children, ...rest }: any) {
            const match = /language-(\w+)/.exec(className || "");

            if (!inline) {
              return (
                <div className="my-4 overflow-auto rounded-lg">
                  <SyntaxHighlighter
                    style={duotoneDark}
                    language={match ? match[1] : undefined}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      borderRadius: "0.5rem",
                      whiteSpace: "pre",
                      overflowX: "auto",
                    }}
                    {...rest}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // inline code
            return (
              <code
                className="px-1 py-0.5 rounded bg-gray-100 text-[#334155] text-[0.9em]"
                {...rest}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}