// GOOD – async page with direct params access
export default async function Page({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string };
}) {
  return <div>Hello</div>;
}