"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

type QuizOption = { id: string; text: string; correct: boolean };
type QuizData = {
  type: "single" | "multi";
  question: string;
  options: QuizOption[];
  explanation?: string;
};

export default function QuizBlock(props: any) {
  // Decode Base64-URL JSON (what your preprocessor produces)
  const data = useMemo(() => {
    const raw = props["data-json"];
    if (!raw) return null;
    try {
      const decoded = decodeURIComponent(escape(atob(raw)));
      return JSON.parse(decoded) as QuizData;
    } catch {
      return null;
    }
  }, [props]);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!data) return null;

  const isSingle = data.type === "single";
  const correctIds = data.options.filter(o => o.correct).map(o => o.id);

  const toggle = (id: string) => {
    setSubmitted(false);
    if (isSingle) setCheckedIds([id]);
    else
      setCheckedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
  };

  const onCheck = () => setSubmitted(true);

  const isCorrect =
    submitted &&
    checkedIds.length === correctIds.length &&
    checkedIds.every(id => correctIds.includes(id));

  // ------- Shared MD renderer for question/explanation -------
  const RichMarkdown = ({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ inline, className, children, ...rest }) {
          const raw = String(children ?? "");
          const match = /language-(\w+)/.exec(className || "");
          // 👇 Heuristic: if it's short / single-line with no language, render inline
          const looksInline =
            !match && (!raw.includes("\n") || raw.trim().length <= 80);

          if (inline || looksInline) {
            return (
              <code
                className="px-1 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[0.9em] inline"
                {...rest}
              >
                {raw}
              </code>
            );
          }

          // Multiline fenced block — match MarkdownRenderer style
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
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 my-4">
      {/* Question (inline + block code with heuristic) */}
      <div className="text-[15px] leading-7 text-[#1B2633] font-bold mb-3">
        <RichMarkdown content={data.question} />
      </div>

      {/* Options (keep your working inline behavior) */}
      <div role="group" className="space-y-2">
        {data.options.map(opt => {
          const selected = checkedIds.includes(opt.id);
          const showState = submitted;
          const showAsCorrect = showState && opt.correct;
          const showAsWrong = showState && selected && !opt.correct;

          return (
            <label
              key={opt.id}
              className={[
                "flex items-start gap-3 rounded-md border p-3 cursor-pointer transition hover:bg-gray-50",
                selected && !showState
                  ? "border-[#00AB55]/40 bg-[#00AB55]/5"
                  : "border-gray-200 bg-white",
                showAsCorrect ? "border-green-400 bg-green-50" : "",
                showAsWrong ? "border-red-400 bg-red-50" : "",
              ].join(" ")}
            >
              <input
                type={isSingle ? "radio" : "checkbox"}
                name={`quiz-${props.id || data.question}-${data.options.length}`}
                checked={selected}
                onChange={() => toggle(opt.id)}
                className="mt-1"
              />
              <span className="text-[15px] leading-7 text-[#1B2633]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code: ({ children }) => (
                      <code className="px-1 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[0.9em] inline">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {opt.text}
                </ReactMarkdown>
              </span>
            </label>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onCheck}
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#00AB55] text-white text-[14px] font-medium hover:opacity-95 transition"
        >
          Check
        </button>

        {submitted && (
          <span
            className={`text-[14px] font-medium ${
              isCorrect ? "text-green-700" : "text-red-700"
            }`}
          >
            {isCorrect ? "Correct ✅" : "Try again ❌"}
          </span>
        )}
      </div>

      {/* Explanation (inline + block with heuristic) */}
      {submitted && data.explanation && (
        <div className="mt-3 text-[14px] leading-6 text-[#454F5B] bg-gray-50 border border-gray-200 rounded-md p-3">
          <RichMarkdown content={data.explanation} />
        </div>
      )}
    </div>
  );
}