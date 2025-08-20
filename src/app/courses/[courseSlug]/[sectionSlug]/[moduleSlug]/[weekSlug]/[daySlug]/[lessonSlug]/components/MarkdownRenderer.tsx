// components/MarkdownRenderer.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// pick a style you like:
import { duotoneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type Props = {
  content: string;
  className?: string; // optional wrapper class
};

/**
 * MarkdownRenderer
 * - Handles headings, paragraphs, lists, quotes, links, images, tables
 * - Pretty fenced code blocks with Prism
 * - Safe-ish HTML via rehype-raw (only include if you trust the source)
 */
export default function MarkdownRenderer({ content, className = "" }: Props) {
  return (
    <div className={`markdown-wrapper ${className}`}>
      <ReactMarkdown
        // GitHub-flavored markdown (tables, task lists, etc.)
        remarkPlugins={[remarkGfm]}
        // Allow inline HTML in markdown. Remove if content is untrusted.
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

          // LINKS / IMAGES
          a: (props) => (
            <a
              {...props}
              className="text-[#B923AE] hover:underline break-words"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              className="max-w-full h-auto rounded-md my-3"
              alt={props.alt ?? ""}
            />
          ),

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
          // NOTE: params are typed as `any` to silence TS complaining about `inline`
          code({ node, inline, className, children, ...props }: any) {
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
                      padding: "1rem 1rem",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      borderRadius: "0.5rem",
                      whiteSpace: "pre",
                      overflowX: "auto",
                    }}
                    {...props}
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
                {...props}
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