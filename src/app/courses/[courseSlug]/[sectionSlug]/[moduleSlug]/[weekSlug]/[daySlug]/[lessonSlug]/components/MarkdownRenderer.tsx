"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import QuizBlock from "@/components/QuizBlock";

type Props = {
  content: string;
  className?: string;
};

// ─────────────────────────────
// Parse alt text options
// ─────────────────────────────
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
      if (/^align:(inline-left|inline-right|left|right|center)$/i.test(p))
        align = p.split(":")[1].toLowerCase();
      else if (/^w:\d+$/i.test(p)) width = parseInt(p.split(":")[1], 10);
      else if (/^h:\d+$/i.test(p)) height = parseInt(p.split(":")[1], 10);
    }
  }

  return { caption, align, width, height };
}

// ─────────────────────────────
// Parse quiz body
// ─────────────────────────────
function parseQuizBody(type: "single" | "multi", body: string) {
  const lines = body.split(/\r?\n/);
  let question = "";
  let explanation = "";
  const options: { text: string; correct: boolean }[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const m = /^-\s*\[(x|\s)\]\s*(.+)$/i.exec(line);
    if (m) {
      options.push({ correct: m[1].toLowerCase() === "x", text: m[2].trim() });
      continue;
    }

    const exp = /^\*\*Explanation:\*\*\s*(.+)$/i.exec(line);
    if (exp) {
      explanation = exp[1].trim();
      continue;
    }

    if (!question) question = line.replace(/^\*\*(.+)\*\*$/, "$1");
  }

  return { type, question, options, explanation };
}

// ─────────────────────────────
// Preprocess directives
// ─────────────────────────────
function preprocessDirectives(markdown: string): string {
  // --- Block (Image + Text layout)
  markdown = markdown.replace(
    /:::block\s*(align:(left|right|center)\s*)?(w:\d+\s*)?([\s\S]*?):::/gi,
    (_, _alignStr, alignSide, widthStr, inner) => {
      const width = widthStr ? parseInt(widthStr.replace(/\D/g, ""), 10) : 45;
      const align = alignSide || "left";
      const flexDir = align === "right" ? "md:flex-row-reverse" : "md:flex-row";

      const imgMatch = inner.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      const textPart = inner.replace(/!\[([^\]]*)\]\(([^)]+)\)/, "").trim();

      if (!imgMatch) return inner;
      const imgAlt = imgMatch[1];
      const imgSrc = imgMatch[2];

      return `
        <div class="flex flex-col ${flexDir} items-center gap-6 my-8">
          <div class="md:w-[${width}%] w-full text-${align}">
            <img src="${imgSrc}" alt="${imgAlt}" class="rounded-md w-full h-auto" />
          </div>
          <div class="md:flex-1 w-full text-[15px] leading-7 text-[#1B2633]">
            ${textPart}
          </div>
        </div>
      `;
    }
  );

  // --- Alert boxes ---
  markdown = markdown.replace(
    /:::alert\s*(type:(success|info|warning|error))?\s*(title:"([^"]+)")?\s*\n([\s\S]*?)\n:::/gi,
    (_, _typeStr, type, _titleStr, title, body) => {
      const map = {
        success: { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7", icon: "✅" },
        info: { bg: "#EFF6FF", text: "#1E3A8A", border: "#93C5FD", icon: "💡" },
        warning: { bg: "#FFFBEB", text: "#92400E", border: "#FACC15", icon: "⚠️" },
        error: { bg: "#FEF2F2", text: "#991B1B", border: "#F87171", icon: "❌" },
      };
      const preset = map[type] || map.info;
      const titleHTML = title
        ? `<div class="flex items-center gap-2 mb-2"><span class="text-lg">${preset.icon}</span><strong>${title}</strong></div>`
        : `<div class="text-lg mb-2">${preset.icon}</div>`;
      return `
<div class="rounded-xl border px-5 py-4 my-6" style="background-color:${preset.bg}; color:${preset.text}; border-color:${preset.border}">
${titleHTML}
<div class="text-[15px] leading-7 text-[#1B2633]">${body.trim()}</div>
</div>`;
    }
  );

  // --- CodePen embeds ---
  markdown = markdown.replace(
    /(codepen:)?https:\/\/codepen\.io\/([^/]+)\/pen\/([a-zA-Z0-9]+)/g,
    (_, prefix: string, user: string, slug: string) => {
      const url = `https://codepen.io/${user}/pen/${slug}`;
      return `
        <p class="codepen"
           data-height="400"
           data-default-tab="html,result"
           data-slug-hash="${slug}"
           data-user="${user}"
           style="height:400px;display:flex;align-items:center;justify-content:center;border:1px solid #ccc;margin:1em 0;padding:1em;">
          <span>See the Pen <a href="${url}">Code Example</a> by ${user}
          (<a href="https://codepen.io/${user}">@${user}</a>)
          on <a href="https://codepen.io">CodePen</a>.</span>
        </p>
      `;
    }
  );

  // --- Quizzes ---
  markdown = markdown.replace(
    /:::quiz\s+(single|multi)\s*([\s\S]*?):::/gi,
    (_, t: string, body: string) => {
      const parsed = parseQuizBody(t.toLowerCase() as "single" | "multi", body);
      const json = encodeURIComponent(
        JSON.stringify({
          type: parsed.type,
          question: parsed.question,
          options: parsed.options.map((o, idx) => ({
            id: `o${idx}`,
            text: o.text,
            correct: o.correct,
          })),
          explanation: parsed.explanation || "",
        })
      );
      return `<quiz-block data-json="${json}"></quiz-block>`;
    }
  );

  return markdown;
}

// ─────────────────────────────
// Component
// ─────────────────────────────
export default function MarkdownRenderer({ content, className = "" }: Props) {
  const processed = preprocessDirectives(content);

  return (
    <div className={`markdown-wrapper ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        skipHtml={false}
        components={{
          // Images
          img: ({ node, ...props }) => {
            const { caption, align, width, height } = parseAltWithOptions(props.alt);
            const style: React.CSSProperties = {
              width: width ? `${width}%` : "auto",
              height: height ? `${height}px` : "auto",
              maxWidth: "100%",
              borderRadius: "0.5rem",
            };

            const isInline = align.startsWith("inline-");
            if (isInline) {
              const flexDir = align === "inline-left" ? "row" : "row-reverse";
              return (
                <div
                  className="flex flex-wrap items-center my-6 gap-4"
                  style={{ flexDirection: flexDir }}
                >
                  <img {...props} style={style} />
                  <div className="flex-1 text-[15px] leading-7 text-[#1B2633]" />
                </div>
              );
            }

            return (
              <figure
                className="my-6"
                style={{
                  textAlign: align === "center" ? "center" : align === "right" ? "right" : "left",
                }}
              >
                <img {...props} style={style} />
                {caption && (
                  <figcaption className="text-sm text-gray-500 mt-1">{caption}</figcaption>
                )}
              </figure>
            );
          },

          // Links
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-purple-600 underline hover:text-purple-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),

          // Headings
          h1: (props) => <h1 {...props} className="text-3xl font-bold text-[#212B36] mt-6 mb-4" />,
          h2: (props) => (
            <h2 {...props} className="text-2xl font-semibold text-[#212B36] mt-6 mb-3" />
          ),
          h3: (props) => (
            <h3 {...props} className="text-xl font-semibold text-[#212B36] mt-5 mb-2" />
          ),
          h4: (props) => (
            <h4 {...props} className="text-lg font-semibold text-[#212B36] mt-4 mb-2" />
          ),
          // Paragraphs
          p: (props) => <p {...props} className="mb-4 text-[15px] leading-7 text-[#1B2633]" />,
          ul: (props) => (
            <ul
              {...props}
              className="list-disc pl-6 space-y-2 mb-4 text-[15px] leading-7 text-[#1B2633]"
            />
          ),
          ol: (props) => (
            <ol
              {...props}
              className="list-decimal pl-6 space-y-2 mb-4 text-[15px] leading-7 text-[#1B2633]"
            />
          ),
          li: (props) => <li {...props} className="text-[15px] leading-7 text-[#1B2633]" />,

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                {...props}
                className="min-w-full border border-gray-300 divide-y divide-gray-300 text-[15px] text-[#1B2633] rounded-lg"
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-gray-100 text-[#212B36] font-semibold" />
          ),
          tbody: ({ node, ...props }) => <tbody {...props} className="divide-y divide-gray-200" />,
          tr: ({ node, ...props }) => (
            <tr {...props} className="hover:bg-gray-50 transition-colors" />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="px-4 py-2 border border-gray-300 text-left font-medium text-[15px]"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="px-4 py-2 border border-gray-200 align-top" />
          ),

          code({ inline, className, children, ...rest }: any) {
            const raw = String(children ?? "").trim();
            const match = /language-(\w+)/.exec(className || "");

            // Detect if this is actually inline but came as a block
            const looksInline =
              !inline && !match && !raw.includes("\n") && raw.length > 0 && raw.length <= 80;

            // ✅ Inline monospace (short snippets)
            if (inline || looksInline) {
              return (
                <code
                  {...rest}
                  className="rounded-md px-1.5 py-0.5 bg-gray-100 text-gray-800 font-mono text-[0.9em]"
                  style={{
                    fontFamily:
                      "'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
                  }}
                >
                  {raw}
                </code>
              );
            }

            // 🔹 Multiline fenced code block
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
                    fontFamily:
                      "'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
                  }}
                  {...rest}
                >
                  {raw.replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },

          "quiz-block": (props: any) => <QuizBlock {...props} />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
