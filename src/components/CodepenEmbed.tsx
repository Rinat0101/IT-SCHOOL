"use client";

import { useEffect } from "react";

export default function CodepenEmbed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cpwebassets.codepen.io/assets/embed/ei.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Use Element.remove() — no-op if the node is already detached, which can
      // happen because the CodePen embed script mutates the surrounding DOM.
      script.remove();
    };
  }, []);

  return null;
}