interface TextBlockProps {
  title?: string;
  content: string;
  subsections?: { id: string; text: string }[];
}

export default function TextBlock({ title, content, subsections }: TextBlockProps) {
  return (
    <div className="mb-6">
      {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
      <p className="text-gray-800 whitespace-pre-line">{content}</p>

      {Array.isArray(subsections) && subsections.length > 0 && (
          <ul>
            {subsections.map((sub) => (
              <li key={sub.id}>{sub.text}</li>
            ))}
          </ul>
        )}
    </div>
  );
}