"use client";

import { useEffect, useRef } from "react";

type Props = {
  user: string;
  slug: string;
  height?: number;
};

/**
 * Renders a CodePen embed inside a React-owned wrapper.
 *
 * CodePen's embed script (`__CPEmbed`) replaces the `<p class="codepen">` element
 * with an `<iframe>`. If we let React render that `<p>` directly, React expects
 * to find it on unmount and throws "Failed to execute 'removeChild'" because the
 * iframe replaced it. Here we render an empty React-owned `<div>` and create the
 * CodePen wrapper imperatively inside it — so React only owns the outer div and
 * never touches the CodePen-managed children.
 */
export default function CodepenBlock({ user, slug, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const wrapper = document.createElement("p");
    wrapper.className = "codepen";
    wrapper.setAttribute("data-height", String(height));
    wrapper.setAttribute("data-default-tab", "html,result");
    wrapper.setAttribute("data-slug-hash", slug);
    wrapper.setAttribute("data-user", user);
    wrapper.style.cssText =
      "height:400px;display:flex;align-items:center;justify-content:center;border:1px solid #ccc;margin:1em 0;padding:1em;";
    wrapper.innerHTML = `<span>See the Pen <a href="https://codepen.io/${user}/pen/${slug}">Code Example</a> by ${user} (<a href="https://codepen.io/${user}">@${user}</a>) on <a href="https://codepen.io">CodePen</a>.</span>`;

    containerRef.current.appendChild(wrapper);

    // Trigger CodePen's transform. Retry briefly in case the global script
    // hasn't finished loading yet.
    let cancelled = false;
    let attempts = 0;
    const tryEmbed = () => {
      if (cancelled) return;
      const w = window as unknown as { __CPEmbed?: () => void };
      if (typeof w.__CPEmbed === "function") {
        w.__CPEmbed();
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryEmbed, 200);
      }
    };
    tryEmbed();

    return () => {
      cancelled = true;
      // No need to remove `wrapper` — the parent containerRef div is
      // React-owned and will be torn down (along with whatever CodePen
      // injected inside it) when this component unmounts.
    };
  }, [user, slug, height]);

  return <div ref={containerRef} />;
}
