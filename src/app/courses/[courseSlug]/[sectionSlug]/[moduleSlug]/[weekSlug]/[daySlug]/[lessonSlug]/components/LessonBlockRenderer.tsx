import React from "react";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import AlertBlock from "./blocks/AlertBlock";
import PresentationBlock from "./blocks/PresentationBlock";

import type { DatoCmsLessonBlock } from "@/types";

interface LessonBlockRendererProps {
  blocks: DatoCmsLessonBlock[];
}

const LessonBlockRenderer: React.FC<LessonBlockRendererProps> = ({ blocks }) => {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => {
        switch (block.__typename) {
          case "TextBlock":
            return (
              <TextBlock
                key={block.id}
                title={block.title}
                content={block.content}
              />
            );

          case "ImageBlock":
            return (
              <ImageBlock
                key={block.id}
                title={block.title}
                imageUrl={block.image_content.url}
                alt={block.title || "Lesson image"}
              />
            );

          case "VideoBlock":
            return (
              <VideoBlock
                key={block.id}
                title={block.title}
                videoUrl={block.video_url}
              />
            );

          case "AlertBlock":
            return (
              <AlertBlock
                key={block.id}
                text={block.text}
                background_color={block.background_color}
                text_color={block.text_color}
              />
            );

          case "PresentationBlock":
            return (
              <PresentationBlock
                key={block.id}
                title={block.title}
                code={block.code}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default LessonBlockRenderer;