// components/lesson/blocks/VideoBlock.tsx
interface VideoBlockProps {
    title?: string;
    videoUrl: string;
  }
  
  export default function VideoBlock({ title, videoUrl }: VideoBlockProps) {
    return (
      <div className="my-6">
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
        <div className="aspect-w-16 aspect-h-9 w-full">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }