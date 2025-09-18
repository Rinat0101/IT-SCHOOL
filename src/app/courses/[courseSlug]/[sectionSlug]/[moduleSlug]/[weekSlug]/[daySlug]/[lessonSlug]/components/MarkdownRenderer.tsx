// components/MarkdownRenderer.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

type Props = {
  content: string;
  className?: string;
};

// Parses alt like: "My caption | align:right w:300 h:180"
function parseAltWithOptions(rawAlt?: string) {
  const alt = (rawAlt ?? "").trim();
  if (!alt) return { caption: "", align: "", width: undefined, height: undefined };

  const hasPipe = alt.includes("|");
  const [maybeCaption, maybeOpts] = hasPipe ? alt.split("|").map((s) => s.trim()) : [alt, ""];

  const caption = hasPipe ? maybeCaption || "" : "";
  let align = "";
  let width: number | undefined;
  let height: number | undefined;

  if (maybeOpts) {
    const parts = maybeOpts.split(/\s+/).filter(Boolean);
    for (const p of parts) {
      if (/^align:(left|right|center)$/i.test(p)) align = p.split(":")[1].toLowerCase();
      else if (/^w:\d+$/i.test(p)) width = parseInt(p.split(":")[1], 10);
      else if (/^h:\d+$/i.test(p)) height = parseInt(p.split(":")[1], 10);
    }
  }

  return { caption, align, width, height };
}

// Preprocess :::alert blocks into styled <div>
function preprocessDirectives(markdown: string): string {
  return markdown.replace(
    /:::alert\s+(\w+)\s*([\s\S]*?):::/g,
    (_, type: string, body: string) => {
      let classes = "";
      switch (type.toLowerCase()) {
        case "info":
          classes = "bg-blue-50 border-l-4 border-blue-400 text-blue-800";
          break;
        case "success":
          classes = "bg-green-50 border-l-4 border-green-400 text-green-800";
          break;
        case "warning":
          classes = "bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800";
          break;
        case "danger":
          classes = "bg-red-50 border-l-4 border-red-400 text-red-800";
          break;
        default:
          classes = "bg-gray-50 border-l-4 border-gray-300 text-gray-800";
      }
      return `<div class="${classes} p-4 rounded-md mb-4">${body.trim()}</div>`;
    }
  );
}

export default function MarkdownRenderer({ content, className = "" }: Props) {
  const processed = preprocessDirectives(content);

  return (
    <div className={`markdown-wrapper ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // HEADINGS
          h1: (props) => <h1 {...props} className="text-3xl font-bold text-[#212B36] mt-6 mb-4" />,
          h2: (props) => <h2 {...props} className="text-2xl font-semibold text-[#212B36] mt-6 mb-3" />,
          h3: (props) => <h3 {...props} className="text-xl font-semibold text-[#212B36] mt-5 mb-2" />,
          h4: (props) => <h4 {...props} className="text-lg font-semibold text-[#212B36] mt-4 mb-2" />,

          // PARAGRAPHS
          p: (props) => (
            <p {...props} className="text-[15px] leading-7 text-[#1B2633] mb-4 whitespace-pre-line" />
          ),

          // EMPHASIS / STRONG
          em: (props) => <em {...props} className="italic" />,
          strong: (props) => <strong {...props} className="font-semibold" />,

          // LISTS
          ul: (props) => <ul {...props} className="list-disc pl-6 space-y-2 mb-4 text-[#1B2633]" />,
          ol: (props) => <ol {...props} className="list-decimal pl-6 space-y-2 mb-4 text-[#1B2633]" />,
          li: (props) => <li {...props} className="leading-7" />,

          // QUOTES
          blockquote: (props) => (
            <blockquote {...props} className="border-l-4 border-gray-200 pl-4 py-2 mb-4 text-[#454F5B] bg-gray-50 rounded" />
          ),

          // LINKS
          a: (props) => (
            <a {...props} className="text-[#B923AE] hover:underline break-words" target="_blank" rel="noopener noreferrer" />
          ),

          // IMAGES
          img: (props) => {
            const { caption, align, width, height } = parseAltWithOptions(props.alt);
            if (align === "right") {
              return (
                <figure className="my-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...props} alt="" className="float-right ml-4 mb-2 rounded-md shadow-sm"
                    style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }} />
                  {caption ? <figcaption className="clear-both text-xs text-[#6B778C] mt-2">{caption}</figcaption> : <div className="clear-both" />}
                </figure>
              );
            }
            if (align === "center") {
              return (
                <figure className="my-4 flex flex-col items-center">
                  <img {...props} alt="" className="rounded-md shadow-sm"
                    style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }} />
                  {caption ? <figcaption className="text-xs text-[#6B778C] mt-2">{caption}</figcaption> : null}
                </figure>
              );
            }
            return (
              <figure className="my-3">
                <img {...props} alt="" className="max-w-full h-auto rounded-md"
                  style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }} />
                {caption ? <figcaption className="text-xs text-[#6B778C] mt-2">{caption}</figcaption> : null}
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
          th: (props) => <th {...props} className="text-left px-3 py-2 bg-gray-50 border-b border-gray-200 font-semibold" />,
          td: (props) => <td {...props} className="px-3 py-2 border-b border-gray-100" />,

          // CODE BLOCKS
          code({ inline, className, children, ...rest }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline) {
              return (
                <div className="my-4 overflow-auto rounded-lg bg-gray-100 border border-gray-200">
                  <SyntaxHighlighter
                    style={duotoneLight}
                    language={match ? match[1] : undefined}
                    PreTag="div"
                    showLineNumbers
                    wrapLines
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      borderRadius: "0.5rem",
                      background: "#F8F9FA",
                      color: "#1B2633",
                    }}
                    {...rest}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return <code className="px-1 py-0.5 rounded bg-gray-200 text-[#212B36] text-[0.9em]" {...rest}>{children}</code>;
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}