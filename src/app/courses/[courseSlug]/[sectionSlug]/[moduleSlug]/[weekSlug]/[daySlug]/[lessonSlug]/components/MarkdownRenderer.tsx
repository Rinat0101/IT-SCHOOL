"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import QuizBlock from "@/components/QuizBlock";
import HiddenTextBlock from "@/components/HiddenTextBlock";

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
  let questionLines: string[] = [];
  let optionLines: string[] = [];
  let explanationLines: string[] = [];

  let section: "question" | "options" | "explanation" = "question";

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect explanation start
    if (/^\*\*Explanation:\*\*/i.test(trimmed)) {
      section = "explanation";
      explanationLines.push(trimmed.replace(/^\*\*Explanation:\*\*\s*/i, ""));
      continue;
    }

    // Detect options
    if (/^-\s*\[(x|\s)\]/i.test(trimmed)) {
      section = "options";
    }

    // Push into the right section
    if (section === "question") questionLines.push(line);
    else if (section === "options") optionLines.push(line);
    else if (section === "explanation") explanationLines.push(line);
  }

  // ✅ Join question lines — keep all markdown (including code fences)
  const question = questionLines.join("\n").trim();

  // ✅ Extract options cleanly
  const options = optionLines
    .map((line) => {
      const m = /^-\s*\[(x|\s)\]\s*(.+)$/i.exec(line.trim());
      if (!m) return null;
      return { correct: m[1].toLowerCase() === "x", text: m[2].trim() };
    })
    .filter(Boolean) as { text: string; correct: boolean }[];

  // ✅ Explanation remains raw markdown
  const explanation = explanationLines.join("\n").trim();

  return { type, question, options, explanation };
}

// ─────────────────────────────
// Preprocess directives
// ─────────────────────────────
function preprocessDirectives(markdown: string): string {
  // --- Combine image + following paragraph into one flex block ---
  markdown = markdown.replace(
    /!\[([^\]]*align:(left|right)[^\]]*)\]\(([^)]+)\)\s*\n+((?:[^\n]+\n?)+?)(?=\n{2,}|$)/gi,
    (_, alt, align, src, text) => {
      const { width } = parseAltWithOptions(alt);
      const flexDir = align === "right" ? "md:flex-row-reverse" : "md:flex-row";
      const imgWidth = width ? `${width}%` : "40%";

      // ⚙️ Use consistent scaling — remove Tailwind w-full, use explicit width instead
      return `
<div class="flex flex-col ${flexDir} items-center gap-6 my-8">
  <div class="flex-shrink-0 flex justify-center md:justify-start" style="width:${imgWidth};">
    <img src="${src}" alt="" style="width:100%; height:auto;" />
  </div>
  <div class="md:flex-1 w-full text-[15px] leading-7 text-[#1B2633]">
    ${text
      .trim()
      .replace(/\n+/g, "<br>")
      .replace(/^([A-Z].*?)(\.|\!|\?)\s/, "<strong>$1</strong>$2 ")}
  </div>
</div>`;
    }
  );

// --- Alert boxes (inline + block code support) ---
markdown = markdown.replace(
  /:::alert\s+(info|success|warning|danger)\s*\n([\s\S]*?)\n:::/gi,
  (_, type, body) => {
    const map = {
      success: { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" },
      info: { bg: "#EFF6FF", text: "#1E3A8A", border: "#93C5FD" },
      warning: { bg: "#FFFBEB", text: "#92400E", border: "#FACC15" },
      danger: { bg: "#FEF2F2", text: "#991B1B", border: "#F87171" },
    };

    const preset = map[type.toLowerCase()] || map.info;

    const lines = body.trim().split(/\r?\n/);
    const firstNonEmptyIndex = lines.findIndex((l) => l.trim().length > 0);

    let title = "";
    let rest = "";

    // Detect bold title
    if (firstNonEmptyIndex !== -1) {
      const firstLine = lines[firstNonEmptyIndex].trim();
      const boldMatch = /^\*\*(.+?)\*\*/.exec(firstLine);
      if (boldMatch) {
        title = boldMatch[1].trim();
        rest = lines.slice(firstNonEmptyIndex + 1).join("\n").trim();
      } else {
        rest = lines.join("\n").trim();
      }
    }

    const titleWithInlineCode = title
      ? `<div class="font-semibold mb-2" style="color:${preset.text}">
          ${title.replace(
            /`([^`]+)`/g,
            '<code class="px-1 py-0.5 bg-gray-100 text-gray-800 font-mono rounded-md text-[0.9em]">$1</code>'
          )}
        </div>`
      : "";

    // ✅ Properly separate text vs code — keeps color for text, syntax for code
    const bodyWithBlocks = rest
      .split(/(```[\s\S]*?```)/g)
      .map((segment) => {
        if (/^```/.test(segment)) {
          const match = /^```(\w+)?\n([\s\S]*?)```$/.exec(segment);
          if (!match) return segment;
          const lang = match[1] || "text";
          const code = match[2].trim();
          return `
<div>
  <pre class="text-[0.9rem] leading-6 font-mono overflow-auto">
    <code class="language-${lang}">${code}</code>
  </pre>
</div>`;
        } else {
          return `<div class="alert-text" style="color:${preset.text}">
            ${segment
              .replace(
                /`([^`]+)`/g,
                '<code class="px-1 py-0.5 bg-gray-100 text-gray-800 font-mono rounded-md text-[0.9em]">$1</code>'
              )
              .trim()}
          </div>`;
        }
      })
      .join("");

    return `
<div class="rounded-xl border px-5 py-4 my-4 text-[15px] leading-7"
     style="background-color:${preset.bg}; border-color:${preset.border}">
  ${titleWithInlineCode}
  ${bodyWithBlocks}
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
</p>`;
    }
  );

  // --- Quizzes ---
  markdown = markdown.replace(
    /:::quiz\s+(single|multi)\s*([\s\S]*?):::/gi,
    (_, t: string, body: string) => {
      const parsed = parseQuizBody(t.toLowerCase() as "single" | "multi", body);

      const json = JSON.stringify({
        type: parsed.type,
        question: parsed.question,
        options: parsed.options.map((o, idx) => ({
          id: `o${idx}`,
          text: o.text,
          correct: o.correct,
        })),
        explanation: parsed.explanation || "",
      });

      // ✅ Encode JSON to base64 (safe for HTML, reversible)
      const encoded = btoa(unescape(encodeURIComponent(json)));

      return `<quiz-block data-json="${encoded}"></quiz-block>`;
    }
  );
  // --- Hidden text blocks (e.g. hint, answer, explanation) ---
  markdown = markdown.replace(
    /:::hidden\s*(type=(\w+))?\s*(color=(\w+))?\s*\n([\s\S]*?)\n:::/gi,
    (_, _typeRaw, type, _colorRaw, color, text) => {
      const title = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Hint";
      const safeText = encodeURIComponent(text.trim());
      const safeColor = color || "green";

      return `<hidden-text-block data-title="${title}" data-color="${safeColor}" data-text="${safeText}"></hidden-text-block>`;
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
            const { align, width, height } = parseAltWithOptions(props.alt);
            const style: React.CSSProperties = {
              width: width ? (String(width).includes("%") ? width : `${width}%`) : "auto",
              height: height ? `${height}px` : "auto",
              maxWidth: "100%",
            };

            // --- Inline image ---
            if (align?.startsWith("inline-")) {
              return (
                <img
                  src={props.src || ""}
                  alt=""
                  style={{
                    ...style,
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginLeft: align === "inline-right" ? "0.4em" : "0",
                    marginRight: align === "inline-left" ? "0.4em" : "0",
                  }}
                />
              );
            }

            // --- Centered block image ---
            const justify =
              align === "center"
                ? "justify-center"
                : align === "right"
                  ? "justify-end"
                  : "justify-start";

            return (
              <div className={`flex ${justify} my-6`}>
                <img src={props.src || ""} alt="" style={{ ...style, display: "block" }} />
              </div>
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
          // Headings (with inline code styling)
          h1: ({ children, ...rest }) => (
            <h1
              {...rest}
              className="text-3xl font-bold text-[#212B36] mt-6 mb-4
               [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-md
               [&>code]:bg-gray-100 [&>code]:text-gray-800
               [&>code]:font-mono [&>code]:text-[0.9em]"
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...rest }) => (
            <h2
              {...rest}
              className="text-2xl font-semibold text-[#212B36] mt-6 mb-3
               [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-md
               [&>code]:bg-gray-100 [&>code]:text-gray-800
               [&>code]:font-mono [&>code]:text-[0.9em]"
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...rest }) => (
            <h3
              {...rest}
              className="text-xl font-semibold text-[#212B36] mt-5 mb-2
               [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-md
               [&>code]:bg-gray-100 [&>code]:text-gray-800
               [&>code]:font-mono [&>code]:text-[0.9em]"
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...rest }) => (
            <h4
              {...rest}
              className="text-lg font-semibold text-[#212B36] mt-4 mb-2
               [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-md
               [&>code]:bg-gray-100 [&>code]:text-gray-800
               [&>code]:font-mono [&>code]:text-[0.9em]"
            >
              {children}
            </h4>
          ),
          // Text elements
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

          // Code blocks
          code({ inline, className, children, ...rest }: any) {
            const raw = String(children ?? "").trim();
            const match = /language-(\w+)/.exec(className || "");

            // ✅ If it’s inline or short (<80 chars, no newlines) → render as inline code
            if (inline || (!match && !raw.includes("\n") && raw.length < 80)) {
              return (
                <code
                  {...rest}
                  className="rounded-md px-1.5 py-0.5 bg-gray-100 text-gray-800 font-mono text-[0.9em]"
                  style={{
                    fontFamily:
                      "'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', monospace",
                  }}
                >
                  {raw}
                </code>
              );
            }

            // ✅ Otherwise, render fenced / multiline blocks
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
                      "'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', monospace",
                  }}
                  {...rest}
                >
                  {raw.replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Quizzes
          "quiz-block": (props: any) => <QuizBlock {...props} />,

          // Hidden text blocks (hints / answers / explanations)
          "hidden-text-block": (props: any) => (
            <HiddenTextBlock
              title={props["data-title"]}
              color={props["data-color"]}
              text={decodeURIComponent(props["data-text"])}
            />
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
