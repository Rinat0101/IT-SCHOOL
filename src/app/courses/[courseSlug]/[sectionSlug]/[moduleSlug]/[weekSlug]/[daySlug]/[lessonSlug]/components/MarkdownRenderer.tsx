"use client";

import type { HTMLAttributes } from "react";
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

type CustomUlProps = HTMLAttributes<HTMLUListElement>;
type CustomOlProps = HTMLAttributes<HTMLOListElement>;
type CustomLiProps = HTMLAttributes<HTMLLIElement>;

// --- Helper: parse alt options for images ---
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

// --- Helper: parse quiz body into JSON ---
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

    if (!question) {
      question = line.replace(/^\*\*(.+)\*\*$/, "$1");
    }
  }

  return { type, question, options, explanation };
}

// --- Preprocess directives (alerts, codepen, quizzes) ---
function preprocessDirectives(markdown: string): string {
  // CodePen
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
           style="height: 400px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc; margin: 1em 0; padding: 1em;">
          <span>See the Pen <a href="${url}">Code Example</a> by ${user}
          (<a href="https://codepen.io/${user}">@${user}</a>)
          on <a href="https://codepen.io">CodePen</a>.</span>
        </p>
      `;
    }
  );

  // Quizzes
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

export default function MarkdownRenderer({ content, className = "" }: Props) {
  const processed = preprocessDirectives(content);

  return (
    <div className={`markdown-wrapper ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={
          {
            a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
              <a
                {...props}
                className="text-purple-600 underline hover:text-purple-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            // Headings
            h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
              <h1 {...props} className="text-3xl font-bold text-[#212B36] mt-6 mb-4" />
            ),
            h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
              <h2 {...props} className="text-2xl font-semibold text-[#212B36] mt-6 mb-3" />
            ),
            h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
              <h3 {...props} className="text-xl font-semibold text-[#212B36] mt-5 mb-2" />
            ),
            h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
              <h4 {...props} className="text-lg font-semibold text-[#212B36] mt-4 mb-2" />
            ),

            // Lists
            ul: (props: HTMLAttributes<HTMLUListElement>) => (
              <ul
                {...props}
                className="list-disc pl-6 space-y-2 mb-4 text-[15px] leading-7 text-[#1B2633]"
              />
            ),
            ol: (props: HTMLAttributes<HTMLOListElement>) => (
              <ol
                {...props}
                className="list-decimal pl-6 space-y-2 mb-4 text-[15px] leading-7 text-[#1B2633]"
              />
            ),
            li: (props: HTMLAttributes<HTMLLIElement>) => (
              <li {...props} className="text-[15px] leading-7 text-[#1B2633]" />
            ),
            // Code blocks
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
              return (
                <code
                  className="px-1 py-0.5 rounded bg-gray-200 text-[#212B36] text-[0.9em]"
                  {...rest}
                >
                  {children}
                </code>
              );
            },

            // Custom QuizBlock mapping
            "quiz-block": (props: any) => <QuizBlock {...props} />,
          } as any
        }
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
