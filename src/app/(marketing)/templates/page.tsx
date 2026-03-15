export default async function TemplatesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 bg-stone-50">
      <div className="mb-12 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-normal text-stone-800">
          Calendar Templates
        </h1>
        <p className="mt-4 text-lg text-stone-500">
          Choose from our collection of professionally designed templates.
        </p>
      </div>
      <p className="text-center text-stone-400">
        Templates are loaded when you create a calendar.
      </p>
    </main>
  );
}
