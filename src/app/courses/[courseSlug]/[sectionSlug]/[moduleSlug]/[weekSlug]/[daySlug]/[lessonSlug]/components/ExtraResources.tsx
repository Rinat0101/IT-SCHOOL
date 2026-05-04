// components/ExtraResources.tsx
import { ExtraResourceBlock } from "@/types";

type Props = {
  resources: ExtraResourceBlock[] | undefined;
};

export default function ExtraResources({ resources }: Props) {
  if (!resources || resources.length === 0) return null;

  return (
    <section id="extra-resources" className="mt-10">
      <h2 className="text-xl font-semibold text-[#212B36] dark:text-gray-100 mb-4">Extra Resources</h2>

      <div className="rounded-2xl shadow-md bg-white dark:bg-[#1a1f29] dark:border dark:border-gray-800 overflow-hidden">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {resources.map((res, i) => {
            const href = res.url || "#";
            return (
              <li key={`extra-${i}`}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-6 py-4 text-[16px] leading-6 text-[#212B36] dark:text-gray-200 font-semibold hover:text-[#00AB55] dark:hover:text-[#34D399]"
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
