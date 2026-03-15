import { notFound } from "next/navigation";

async function getSharedCalendar(shareId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/calendars/public/${shareId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export default async function SharedCalendarPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const calendar = await getSharedCalendar(shareId);

  if (!calendar) {
    notFound();
  }

  const MONTH_NAMES = [
    "Cover",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">{calendar.title}</h1>
        <p className="mt-2 text-stone-500">
          {calendar.calendarYear} &middot; {calendar.paperSize}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calendar.pages?.map(
          (page: { id: string; monthIndex: number; imageUrl: string | null }) => (
            <div key={page.id} className="rounded-2xl bg-white p-3 shadow-md">
              <div
                className="aspect-[3/4] rounded-xl bg-gradient-to-br from-rose-50 to-amber-50"
                style={{
                  backgroundImage: page.imageUrl
                    ? `url(${page.imageUrl})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <p className="mt-2 text-center text-sm font-medium text-stone-700">
                {MONTH_NAMES[page.monthIndex]}
              </p>
            </div>
          )
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-stone-400">
          Made with{" "}
          <a href="/" className="text-rose-500 hover:text-rose-600 hover:underline">
            Calfolio
          </a>
        </p>
      </div>
    </main>
  );
}
