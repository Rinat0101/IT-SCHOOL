// components/LessonTopicsSidebar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DatoCmsLessonBlock, ExtraResourceBlock } from "@/types";

type Props = {
  blocks?: DatoCmsLessonBlock[];
  className?: string;
  extraResources?: ExtraResourceBlock[];
};

type SidebarSection = {
  id: string;
  title: string;
  targetId?: string;
  subsections: { id: string; label: string; targetId?: string }[];
};

export default function LessonTopicsSidebar({
  blocks,
  className = "",
  extraResources = [],
}: Props) {
  const hasExtra = Array.isArray(extraResources) && extraResources.length > 0;
  const EXTRA_ID = "extra-resources";
  const HEADER_OFFSET = 80;
  const PIVOT_OFFSET = 120;

  // ---------- build sections ----------
  const sections = useMemo<SidebarSection[]>(() => {
    if (!Array.isArray(blocks)) return [];

    const base =
      (blocks
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
        .filter(Boolean) as SidebarSection[]) || [];

    if (hasExtra) {
      base.push({
        id: "extra_resources_sidebar",
        title: "Extra Resources",
        targetId: EXTRA_ID,
        subsections: [],
      });
    }

    return base;
  }, [blocks, hasExtra]);

  // ---------- state ----------
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);

  // ---------- scroll spy ----------
  const suppressUntil = useRef<number>(0);
  const targetsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    targetsRef.current = sections.map((s) =>
      s.targetId ? (document.getElementById(s.targetId) as HTMLElement | null) : null
    );
  }, [sections]);

  useEffect(() => {
    if (!sections.length) return;

    let ticking = false;

    const pickActive = () => {
      ticking = false;
      if (Date.now() < suppressUntil.current) return;

      const pivot = window.scrollY + HEADER_OFFSET + PIVOT_OFFSET;

      // stick to last (Extra Resources) near bottom
      if (hasExtra) {
        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (nearBottom) {
          const last = sections[sections.length - 1];
          if (last?.targetId === EXTRA_ID && activeId !== last.id) {
            setActiveId(last.id);
          }
          return;
        }
      }

      let candidateIndex = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = targetsRef.current[i];
        if (!el) continue;
        if (el.offsetTop <= pivot) candidateIndex = i;
        else break;
      }

      const candidate = sections[candidateIndex];
      if (candidate && candidate.id !== activeId) {
        setActiveId(candidate.id);
      }
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(pickActive);
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    onScrollOrResize();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [sections, activeId, hasExtra]);

  const scrollToId = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    const targetY = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 4;
    const distance = Math.abs(window.scrollY - targetY);
    const duration = Math.min(900, Math.max(350, distance * 0.6));
    suppressUntil.current = Date.now() + duration + 150;

    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  if (sections.length === 0) return null;

  return (
    <aside className={`w-full max-w-xs ${className}`}>
      <h2 className="text-xs font-semibold tracking-[0.06em] text-[#202733] mb-3 uppercase">
        Lesson topics
      </h2>

      <nav className="space-y-1">
        {sections.map((sec) => {
          const isActive = activeId === sec.id;

          return (
            <div key={sec.id} className="relative">
              {/* active accent */}
              <span
                className={`absolute left-0 top-0 h-full w-[3px] rounded-full transition-opacity ${
                  isActive ? "bg-[#00AB55] opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />

              <div className="pl-4 pr-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(sec.id);
                    scrollToId(sec.targetId);
                  }}
                  className={`flex-1 text-left py-2 rounded-md transition leading-6 text-[15px] w-full ${
                    isActive
                      ? "text-[#00AB55] font-semibold"
                      : "text-[#6B778C] hover:text-[#202733] font-medium"
                  }`}
                >
                  {sec.title}
                </button>
              </div>

              {/* subsections only if active */}
              {isActive && sec.subsections.length > 0 && (
                <ul className="mt-1 pl-7 space-y-2">
                  {sec.subsections.map((sub) => (
                    <li key={sub.id} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#7A869A]" />
                      {sub.targetId ? (
                        <a
                          href={`#${sub.targetId}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveId(sec.id);
                            scrollToId(sub.targetId);
                          }}
                          className="text-[13px] leading-5 text-[#6B778C] hover:text-[#202733] underline-offset-2 hover:underline"
                        >
                          {sub.label}
                        </a>
                      ) : (
                        <span className="text-[13px] leading-5 text-[#6B778C]">
                          {sub.label}
                        </span>
                      )}
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

// // components/LessonTopicsSidebar.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { DatoCmsLessonBlock, ExtraResourceBlock } from "@/types";

// type Props = {
//   blocks?: DatoCmsLessonBlock[];
//   className?: string;
//   extraResources?: ExtraResourceBlock[];
// };

// type SidebarSection = {
//   id: string;
//   title: string;
//   targetId?: string;
//   subsections: { id: string; label: string; targetId?: string }[];
// };

// export default function LessonTopicsSidebar({
//   blocks,
//   className = "",
//   extraResources = [],
// }: Props) {
//   const hasExtra = Array.isArray(extraResources) && extraResources.length > 0;
//   const EXTRA_ID = "extra-resources";
//   const HEADER_OFFSET = 80;  // fixed header height
//   const PIVOT_OFFSET = 120;  // distance below header to judge “current”

//   // ---------- build sections (plus Extra Resources at end) ----------
//   const sections = useMemo<SidebarSection[]>(() => {
//     if (!Array.isArray(blocks)) return [];

//     const base =
//       (blocks
//         .map((b: any) => {
//           const isText =
//             b?.__typename === "TextBlockRecord" || b?.__typename === "TextBlock";
//           if (!isText) return null;

//           const title =
//             typeof b?.title === "string" && b.title.trim() ? b.title.trim() : undefined;

//           const raw = b?.subsections;
//           const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

//           const subsections = arr
//             .map((s: any) => {
//               const label =
//                 (typeof s?.title === "string" && s.title.trim()) ||
//                 (typeof s?.text === "string" && s.text.trim()) ||
//                 null;
//               if (!label) return null;
//               return {
//                 id: s?.id ?? crypto.randomUUID(),
//                 label,
//                 targetId: s?.id ? `sub-${s.id}` : undefined,
//               };
//             })
//             .filter(Boolean) as { id: string; label: string; targetId?: string }[];

//           if (!title && subsections.length === 0) return null;

//           return {
//             id: b?.id ?? crypto.randomUUID(),
//             title: title ?? "Untitled",
//             targetId: b?.id ? `sec-${b.id}` : undefined,
//             subsections,
//           };
//         })
//         .filter(Boolean) as SidebarSection[]) || [];

//     if (hasExtra) {
//       base.push({
//         id: "extra_resources_sidebar",
//         title: "Extra Resources",
//         targetId: EXTRA_ID,
//         subsections: [],
//       });
//     }

//     return base;
//   }, [blocks, hasExtra]);

//   // ---------- state ----------
//   const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
//   const [openIds, setOpenIds] = useState<Set<string>>(
//     () => new Set(sections[0] ? [sections[0].id] : [])
//   );

//   // helper to toggle open/close for any section
//   const toggleOpen = (id: string) => {
//     setOpenIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) {
//         next.delete(id);
//       } else {
//         next.add(id);
//       }
//       return next;
//     });
//   };

//   // ---------- programmatic scroll suppression ----------
//   const suppressUntil = useRef<number>(0);
//   const suppressFor = (ms: number) => {
//     suppressUntil.current = Date.now() + ms;
//   };

//   // ---------- cache target elements ----------
//   const targetsRef = useRef<(HTMLElement | null)[]>([]);
//   useEffect(() => {
//     targetsRef.current = sections.map((s) =>
//       s.targetId ? (document.getElementById(s.targetId) as HTMLElement | null) : null
//     );
//   }, [sections]);

//   // ---------- scroll spy with requestAnimationFrame ----------
//   useEffect(() => {
//     if (!sections.length) return;

//     let ticking = false;

//     const pickActive = () => {
//       ticking = false;

//       if (Date.now() < suppressUntil.current) return;

//       const pivot = window.scrollY + HEADER_OFFSET + PIVOT_OFFSET;

//       // near bottom → stick to “Extra Resources”
//       if (hasExtra) {
//         const nearBottom =
//           window.innerHeight + window.scrollY >=
//           document.documentElement.scrollHeight - 2;
//         if (nearBottom) {
//           const last = sections[sections.length - 1];
//           if (last?.targetId === EXTRA_ID && activeId !== last.id) {
//             setActiveId(last.id);
//             setOpenIds((prev) => {
//               const next = new Set(prev);
//               next.add(last.id);
//               return next;
//             });
//           }
//           return;
//         }
//       }

//       let candidateIndex = 0;
//       for (let i = 0; i < sections.length; i++) {
//         const el = targetsRef.current[i];
//         if (!el) continue;
//         const top = el.offsetTop;
//         if (top <= pivot) candidateIndex = i;
//         else break;
//       }

//       const candidate = sections[candidateIndex];
//       if (candidate && candidate.id !== activeId) {
//         setActiveId(candidate.id);
//         setOpenIds((prev) => {
//           const next = new Set(prev);
//           next.add(candidate.id); // auto-expand active section
//           return next;
//         });
//       }
//     };

//     const onScrollOrResize = () => {
//       if (!ticking) {
//         ticking = true;
//         requestAnimationFrame(pickActive);
//       }
//     };

//     window.addEventListener("scroll", onScrollOrResize, { passive: true });
//     window.addEventListener("resize", onScrollOrResize);
//     onScrollOrResize();

//     return () => {
//       window.removeEventListener("scroll", onScrollOrResize);
//       window.removeEventListener("resize", onScrollOrResize);
//     };
//   }, [sections, activeId, hasExtra]);

//   // ---------- smooth scroll helper ----------
//   const scrollToId = (id?: string) => {
//     if (!id) return;
//     const el = document.getElementById(id);
//     if (!el) return;

//     const targetY = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 4;
//     const distance = Math.abs(window.scrollY - targetY);
//     const duration = Math.min(900, Math.max(350, distance * 0.6));
//     suppressFor(duration + 150);

//     window.scrollTo({ top: targetY, behavior: "smooth" });
//   };

//   if (sections.length === 0) return null;

//   return (
//     <aside className={`w-full max-w-xs ${className}`}>
//       <h2 className="text-xs font-semibold tracking-[0.06em] text-[#202733] mb-3 uppercase">
//         Lesson topics
//       </h2>

//       <nav className="space-y-1">
//         {sections.map((sec) => {
//           const isActive = activeId === sec.id;
//           const isOpen = openIds.has(sec.id);
//           const hasSubs = sec.subsections.length > 0;

//           return (
//             <div key={sec.id} className="relative">
//               {/* active accent */}
//               <span
//                 className={`absolute left-0 top-0 h-full w-[3px] rounded-full transition-opacity ${
//                   isActive ? "bg-[#00AB55] opacity-100" : "opacity-0"
//                 }`}
//                 aria-hidden
//               />

//               <div className="pl-4 pr-2">
//                 <div className="flex items-center">
//                   {/* SECTION TITLE */}
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setActiveId(sec.id);
//                       scrollToId(sec.targetId);
//                       setOpenIds((prev) => {
//                         const next = new Set(prev);
//                         next.add(sec.id); // ensure expanded when clicked
//                         return next;
//                       });
//                     }}
//                     className={`flex-1 text-left py-2 rounded-md transition leading-6 text-[15px] ${
//                       isActive
//                         ? "text-[#00AB55] font-semibold"
//                         : "text-[#6B778C] hover:text-[#202733] font-medium"
//                     }`}
//                   >
//                     {sec.title}
//                   </button>

//                   {/* toggler */}
//                   {hasSubs ? (
//                     <button
//                       type="button"
//                       aria-label={isOpen ? "Collapse section" : "Expand section"}
//                       aria-expanded={isOpen}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         toggleOpen(sec.id);
//                         setActiveId(sec.id);
//                       }}
//                       className="ml-1 p-2 rounded-md text-[#6B778C] hover:bg-gray-100"
//                     >
//                       <span
//                         className={`inline-block border-t-[2px] border-l-[2px] border-current w-2.5 h-2.5 transform transition-transform origin-center ${
//                           isOpen
//                             ? "rotate-45 translate-y-[1px]"
//                             : "-rotate-135 -translate-y-[1px]"
//                         }`}
//                         aria-hidden
//                       />
//                     </button>
//                   ) : (
//                     <span className="ml-2 p-2 text-transparent select-none">•</span>
//                   )}
//                 </div>
//               </div>

//               {/* subsections */}
//               {isOpen && hasSubs && (
//                 <ul className="mt-1 pl-7 space-y-2">
//                   {sec.subsections.map((sub) => {
//                     const clickable = !!sub.targetId;
//                     return (
//                       <li key={sub.id} className="flex items-start gap-2">
//                         <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#7A869A]" />
//                         {clickable ? (
//                           <a
//                             href={`#${sub.targetId}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               setActiveId(sec.id);
//                               scrollToId(sub.targetId);
//                               setOpenIds((prev) => {
//                                 const next = new Set(prev);
//                                 next.add(sec.id);
//                                 return next;
//                               });
//                             }}
//                             className="text-[13px] leading-5 text-[#6B778C] hover:text-[#202733]"
//                           >
//                             {sub.label}
//                           </a>
//                         ) : (
//                           <span className="text-[13px] leading-5 text-[#6B778C]">
//                             {sub.label}
//                           </span>
//                         )}
//                       </li>
//                     );
//                   })}
//                 </ul>
//               )}
//             </div>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }