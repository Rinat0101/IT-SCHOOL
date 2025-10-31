import Image from "next/image";

type Props = {
  title: string;
  description: string;
  buttonText: string;
  imageUrl?: string;
  url: string;
};

export default function NonPurchasedCourseCard({
  title,
  description,
  buttonText,
  imageUrl,
  url
}: Props) {
  return (
    <div className="relative flex items-center bg-blue-3 rounded-xl p-6 shadow-light-mode overflow-hidden">
      {/* Left Side */}
      <div className="flex-1 min-w-0 relative z-20">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-2 mb-4">{description}</p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-1 text-white py-2 px-6 rounded-md hover:bg-blue-600 btn-shadow cursor-pointer"
          style={{
            position: "relative",
            zIndex: 30,
            pointerEvents: "auto",
          }}
        >
          {buttonText}
        </a>
      </div>

      {/* Right Side (Image) */}
      <div
        className="ml-6 flex items-center justify-end w-[45%] relative z-10"
        style={{ pointerEvents: "none" }}
      >
        {imageUrl && (
          <div className="relative w-[420px] h-[150px]">
            <Image
              src={imageUrl}
              alt="Course Illustration"
              fill
              className="object-contain w-auto h-auto rounded-md"
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}
