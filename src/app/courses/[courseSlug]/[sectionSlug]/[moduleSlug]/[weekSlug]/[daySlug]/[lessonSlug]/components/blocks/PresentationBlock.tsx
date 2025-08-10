interface PresentationBlockProps {
    title?: string;
    code: string;
  }
  
  export default function PresentationBlock({ title, code }: PresentationBlockProps) {
    return (
      <div className="mb-6">
        {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
        <pre className="bg-gray-900 text-white text-sm p-4 rounded-md overflow-x-auto whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    );
  }