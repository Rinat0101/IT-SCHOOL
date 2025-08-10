import { ExtraResourceBlock } from "@/types";

type Props = {
  resources: ExtraResourceBlock[];
};

export default function ExtraResources({ resources }: Props) {
  if (!resources?.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Extra Resources</h2>

      <div className="space-y-4">
        {resources.map((res, idx) => (
          <a
            key={idx}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl shadow-sm bg-white hover:shadow-md transition p-5 border border-gray-100"
          >
            <p className="text-lg text-gray-800 font-medium">{res.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
}