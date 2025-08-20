// components/ExtraResources.tsx
import { ExtraResourceBlock } from "@/types";

type Props = {
  resources: ExtraResourceBlock[] | undefined;
};

export default function ExtraResources({ resources }: Props) {
  if (!resources || resources.length === 0) return null;

  return (
    <section id="extra-resources" className="mt-10">
      <h2 className="text-xl font-semibold text-[#212B36] mb-4">Extra Resources</h2>

      <div className="rounded-2xl shadow-md bg-white overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {resources.map((res, i) => {
            const href = res.url || "#";
            return (
              <li key={`extra-${i}`}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-6 py-4 text-[16px] leading-6 text-[#212B36] font-semibold hover:text-[#00AB55]"
                >
                  {res.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
