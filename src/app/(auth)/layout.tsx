export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a href="/" className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">
            Calfolio
          </a>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
}
