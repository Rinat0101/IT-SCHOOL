"use client";

type Provider = "youtube" | "vimeo" | "loom";

type Props = {
  provider: Provider;
  id: string;
};

const SOURCES: Record<Provider, { src: (id: string) => string; title: string }> = {
  // youtube-nocookie reduces tracking for visitors who don't interact with the player
  youtube: {
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
    title: "YouTube video",
  },
  vimeo: {
    src: (id) => `https://player.vimeo.com/video/${id}`,
    title: "Vimeo video",
  },
  loom: {
    src: (id) => `https://www.loom.com/embed/${id}`,
    title: "Loom video",
  },
};

export default function VideoBlock({ provider, id }: Props) {
  const config = SOURCES[provider];
  if (!config || !id) return null;

  return (
    <div
      className="my-6 relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-black"
      // 16:9 aspect ratio
      style={{ paddingBottom: "56.25%" }}
    >
      <iframe
        src={config.src(id)}
        title={config.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
