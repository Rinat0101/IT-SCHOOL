interface AlertBlockProps {
    text: string;
    background_color: string;
    text_color: string;
  }
  
  export default function AlertBlock({
    text,
    background_color,
    text_color,
  }: AlertBlockProps) {
    return (
      <div
        className="p-4 rounded-md my-4"
        style={{
          backgroundColor: background_color,
          color: text_color,
        }}
      >
        <p className="whitespace-pre-line">{text}</p>
      </div>
    );
  }