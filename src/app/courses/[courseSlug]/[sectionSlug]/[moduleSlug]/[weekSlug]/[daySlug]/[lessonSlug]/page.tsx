export default function HomePage({ params }: { params?: any }) {
  console.log("🌍 Page Params:", params);

  return (
    <main>
      <h1>Hello from root</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </main>
  );
}