// components/LessonTopicsSidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { DatoCmsLessonBlock } from "@/types";

type Props = { blocks?: DatoCmsLessonBlock[]; className?: string };

type SidebarSection = {
  id: string;
  title: string;
  targetId?: string;
  subsections: { id: string; label: string; targetId?: string }[];
};

export default function LessonTopicsSidebar({ blocks, className = "" }: Props) {
  const sections = useMemo<SidebarSection[]>(() => {
    if (!Array.isArray(blocks)) return [];
    return (
      blocks
        .map((b: any) => {
          const isText =
            b?.__typename === "TextBlockRecord" || b?.__typename === "TextBlock";
          if (!isText) return null;

          const title =
            typeof b?.title === "string" && b.title.trim() ? b.title.trim() : undefined;

          const raw = b?.subsections;
          const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

          const subsections = arr
            .map((s: any) => {
              const label =
                (typeof s?.title === "string" && s.title.trim()) ||
                (typeof s?.text === "string" && s.text.trim()) ||
                null;
              if (!label) return null;
              return {
                id: s?.id ?? crypto.randomUUID(),
                label,
                targetId: s?.id ? `sub-${s.id}` : undefined,
              };
            })
            .filter(Boolean) as { id: string; label: string; targetId?: string }[];

          if (!title && subsections.length === 0) return null;

          return {
            id: b?.id ?? crypto.randomUUID(),
            title: title ?? "Untitled",
            targetId: b?.id ? `sec-${b.id}` : undefined,
            subsections,
          };
        })
        .filter(Boolean) as SidebarSection[]
    );
  }, [blocks]);

  const [openId, setOpenId] = useState<string | null>(() => {
    const first = sections.find((s) => s.subsections.length > 0);
    return first?.id ?? null;
  });
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visibleTop = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visibleTop) return;
        const tid = visibleTop.target.getAttribute("id");
        const sec = sections.find((s) => s.targetId === tid);
        if (sec) {
          setActiveId(sec.id);
          if (sec.subsections.length) setOpenId(sec.id);
        }
      },
      { root: null, rootMargin: "0px 0px -60% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    const targets = sections
      .map((s) => s.targetId)
      .filter(Boolean)
      .map((id) => document.getElementById(id!))
      .filter(Boolean) as Element[];
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const scrollToId = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (sections.length === 0) return null;

  return (
    <aside className={`w-full max-w-xs ${className}`}>
      <h2 className="text-sm font-semibold tracking-[0.06em] text-[#202733] mb-4 uppercase">
        Lesson topics
      </h2>

      <nav className="space-y-2">
        {sections.map((sec) => {
          const isActive = activeId === sec.id;
          const isOpen = openId === sec.id;
          const hasSubs = sec.subsections.length > 0;

          return (
            <div key={sec.id} className="relative">
              {/* green left accent for active */}
              <span
                className={`absolute left-0 top-0 h-full w-[3px] rounded-full transition-opacity ${
                  isActive ? "bg-[#00AB55] opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />
              <div className="pl-4 pr-2">
                <div className="flex items-center">
                  {/* Title: scroll to section + mark active */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(sec.id);
                      scrollToId(sec.targetId);
                    }}
                    className={`flex-1 text-left py-3 rounded-md transition text-lg leading-6 ${
                      isActive ? "text-[#00AB55]" : "text-[#6B778C] hover:text-[#202733]"
                    }`}
                  >
                    {sec.title}
                  </button>

                  {/* Chevron: only expand/collapse (no scroll) */}
                  {hasSubs ? (
                    <button
                      type="button"
                      aria-label={isOpen ? "Collapse section" : "Expand section"}
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId((p) => (p === sec.id ? null : sec.id));
                      }}
                      className="ml-2 px-2 py-2 rounded-md text-[#6B778C] hover:bg-gray-100"
                    >
                      <span
                        className={`inline-block transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      >
                        ▾
                      </span>
                    </button>
                  ) : (
                    <span className="ml-2 px-2 py-2 text-transparent select-none">•</span>
                  )}
                </div>
              </div>

              {isOpen && hasSubs && (
                <ul className="mt-2 pl-8 space-y-3">
                  {sec.subsections.map((sub) => (
                    <li key={sub.id} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#7A869A]" />
                      <button
                        type="button"
                        onClick={() => scrollToId(sub.targetId)}
                        className="text-left text-base leading-6 text-[#6B778C] hover:text-[#202733]"
                      >
                        {sub.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}