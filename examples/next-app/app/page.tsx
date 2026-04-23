import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">next-ai example</h1>
      <p className="mt-2">
        <Link className="underline" href="/settings/ai">
          Open AI settings
        </Link>
      </p>
    </main>
  );
}
