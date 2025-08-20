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
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block: any, i: number) => {
        const baseId = typeof block?.id === "string" ? block.id : `blk-${i}`;
        const sectionId = `sec-${baseId}`;

        const wrap = (node: React.ReactNode, labelledById?: string) => (
          <section
            id={sectionId}
            key={sectionId}
            className="scroll-mt-[88px]" 
            aria-labelledby={labelledById}
          >
            {node}
          </section>
        );

        switch (block.__typename) {
          case "TextBlockRecord":
          case "TextBlock": {
            const titleId = block?.title ? `title-${baseId}` : undefined;
            return wrap(
              <TextBlock
                id={baseId}
                title={block.title}
                content={block.content}
                subsections={block.subsections}
              />,
              titleId
            );
          }

          case "ImageBlockRecord":
          case "ImageBlock": {
            const url = block?.imageContent?.url || block?.image_content?.url;
            if (!url) return null;
            return wrap(
              <ImageBlock title={block.title} imageUrl={url} alt={block.title || "Lesson image"} />
            );
          }

          case "VideoBlockRecord":
          case "VideoBlock": {
            const v = block?.videoUrl ?? block?.video_url;
            const url = typeof v === "string" ? v : v?.url;
            if (!url) return null;
            return wrap(<VideoBlock title={block.title} videoUrl={url} />);
          }

          case "AlertBlockRecord":
          case "AlertBlock": {
            return wrap(
              <AlertBlock
                text={block.text}
                background_color={block.backgroundColor ?? block.background_color}
                text_color={block.textColor ?? block.text_color}
              />
            );
          }

          case "PresentationBlockRecord":
          case "PresentationBlock": {
            return wrap(<PresentationBlock title={block.title} code={block.code} />);
          }

          default:
            return null;
        }
      })}
    </div>
  );
}