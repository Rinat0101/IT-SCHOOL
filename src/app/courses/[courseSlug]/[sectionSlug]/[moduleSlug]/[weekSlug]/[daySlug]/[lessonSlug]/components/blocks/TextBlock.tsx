interface TextBlockProps {
  id?: string;
  title?: string | null;
  content: string;
  subsections?: { id: string; title?: string | null; text?: string | null }[] | null;
}

export default function TextBlock({ id, title, content, subsections }: TextBlockProps) {
  return (
    <div className="mb-6">
      {title && (
        <h2
          id={`sec-${id}`}
          className="text-xl font-semibold text-[#202733] mb-2" 
        >
          {title}
        </h2>
      )}

      <p className="text-[#212B36] text-base leading-6 whitespace-pre-line">
        {content}
      </p>

      {Array.isArray(subsections) && subsections.length > 0 && (
        <div className="mt-4 space-y-2">
          {subsections.map((sub) => {
            const label =
              (sub.title && sub.title.trim()) || (sub.text && sub.text.trim());
            if (!label) return null;
            return (
              <h3
                key={sub.id}
                id={`sub-${sub.id}`}
                className="text-[15px] font-medium text-[#454F5B]" 
              >
                {label}
              </h3>
            );
          })}
        </div>
      )}
    </div>
  );
}