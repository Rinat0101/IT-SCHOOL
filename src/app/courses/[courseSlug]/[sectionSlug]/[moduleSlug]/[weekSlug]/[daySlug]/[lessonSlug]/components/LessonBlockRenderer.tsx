// components/LessonBlockRenderer.tsx
import React from "react";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import AlertBlock from "./blocks/AlertBlock";
import PresentationBlock from "./blocks/PresentationBlock";
import type { DatoCmsLessonBlock } from "@/types";

interface LessonBlockRendererProps {
  blocks: DatoCmsLessonBlock[] | undefined;
}

export default function LessonBlockRenderer({ blocks }: LessonBlockRendererProps) {
  if (!blocks?.length) return null;

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block: any) => {
        const wrapperId = block?.id ? `sec-${block.id}` : undefined;

        switch (block.__typename) {
          case "TextBlockRecord":
          case "TextBlock":
            return (
              <section id={wrapperId} key={block.id}>
                <TextBlock
                  id={block.id}                          
                  title={block.title}
                  content={block.content}
                  subsections={block.subsections}
                />
              </section>
            );

          case "ImageBlockRecord":
          case "ImageBlock": {
            const url = block?.imageContent?.url || block?.image_content?.url;
            if (!url) return null;
            return (
              <section id={wrapperId} key={block.id}>
                <ImageBlock title={block.title} imageUrl={url} alt={block.title || "Lesson image"} />
              </section>
            );
          }

          case "VideoBlockRecord":
          case "VideoBlock": {
            const v = block.videoUrl ?? block.video_url;
            const url = typeof v === "string" ? v : v?.url;
            if (!url) return null;
            return (
              <section id={wrapperId} key={block.id}>
                <VideoBlock title={block.title} videoUrl={url} />
              </section>
            );
          }

          case "AlertBlockRecord":
          case "AlertBlock":
            return (
              <section id={wrapperId} key={block.id}>
                <AlertBlock
                  text={block.text}
                  background_color={block.backgroundColor ?? block.background_color}
                  text_color={block.textColor ?? block.text_color}
                />
              </section>
            );

          case "PresentationBlockRecord":
          case "PresentationBlock":
            return (
              <section id={wrapperId} key={block.id}>
                <PresentationBlock title={block.title} code={block.code} />
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}