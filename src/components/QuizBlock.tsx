"use client";

import { useMemo, useState } from "react";

type QuizOption = { id: string; text: string; correct: boolean };
type QuizData = {
  type: "single" | "multi";
  question: string;
  options: QuizOption[];
  explanation?: string;
};

function parseDataJson(raw?: string): QuizData | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function QuizBlock(props: any) {
  const data = useMemo(() => parseDataJson(props["data-json"]), [props]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!data) return null;

  const isSingle = data.type === "single";
  const correctIds = data.options.filter(o => o.correct).map(o => o.id);

  const toggle = (id: string) => {
    setSubmitted(false);
    if (isSingle) {
      setCheckedIds([id]);
    } else {
      setCheckedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  const onCheck = () => setSubmitted(true);

  const isCorrect =
    submitted &&
    checkedIds.length === correctIds.length &&
    checkedIds.every(id => correctIds.includes(id));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 my-4">
      {/* 👇 Force font-normal so it never renders bold */}
      <p className="text-[15px] leading-7 text-[#1B2633] font-bold mb-3">
        {data.question}
      </p>

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
                {opt.text}
              </span>
            </label>
          );
        })}
      </div>

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

      {submitted && data.explanation && (
        <div className="mt-3 text-[14px] leading-6 text-[#454F5B] bg-gray-50 border border-gray-200 rounded-md p-3">
          {data.explanation}
        </div>
      )}
    </div>
  );
}