interface ImageBlockProps {
    title?: string;
    imageUrl: string;
    alt?: string;
  }
  
  export default function ImageBlock({ title, imageUrl, alt }: ImageBlockProps) {
    return (
      <div className="my-6">
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
        <img src={imageUrl} alt={alt || title || "Lesson image"} className="rounded-lg max-w-full" />
      </div>
    );
  }