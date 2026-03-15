export default function PricingPage() {
  const tiers = [
    {
      name: "Hobby",
      price: "5",
      period: "month",
      features: [
        "5 active calendars",
        "10 PDF exports/month",
        "100 image uploads/month",
        "No watermark",
        "Order printed calendars",
      ],
    },
    {
      name: "Pro",
      price: "12",
      period: "month",
      popular: true,
      features: [
        "Unlimited calendars",
        "Unlimited PDF exports",
        "500 image uploads/month",
        "No watermark",
        "Premium templates",
        "Order printed calendars",
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-20 bg-stone-50">
      <div className="mb-12 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-normal text-stone-800">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-stone-500">
          Start free, upgrade when you need more.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border p-8 bg-white ${
              tier.popular
                ? "border-rose-300 ring-1 ring-rose-100"
                : "border-stone-200"
            }`}
          >
            {tier.popular && (
              <span className="mb-4 inline-block rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-bold text-stone-800">{tier.name}</h2>
            <p className="mt-2">
              <span className="text-4xl font-bold text-stone-800">
                &pound;{tier.price}
              </span>
              <span className="text-stone-500">/{tier.period}</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-stone-700">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-500">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <button className="mt-8 w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600">
              Get started
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-normal text-stone-800">
          Print pricing
        </h2>
        <p className="mt-2 text-stone-500">
          Order printed wall calendars shipped to your door.
        </p>
        <div className="mt-6 inline-block rounded-2xl shadow-sm bg-white p-6 text-left">
          <div className="space-y-2 text-sm text-stone-700">
            <div className="flex justify-between gap-12">
              <span>A4 Wall Calendar</span>
              <span className="font-medium text-stone-800">
                from &pound;18
              </span>
            </div>
            <div className="flex justify-between gap-12">
              <span>A5 Wall Calendar</span>
              <span className="font-medium text-stone-800">
                from &pound;15
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-stone-400">
            Prices include printing and handling. Shipping calculated at
            checkout.
          </p>
        </div>
      </div>
    </main>
  );
}
