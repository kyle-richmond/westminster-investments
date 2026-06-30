export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h1 className="text-5xl font-bold text-slate-900">
          Westminster Investments
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Search MPs, companies, and declared financial interests from the UK
          Parliament Register of Members' Financial Interests.
        </p>

        <div className="mt-10">
          <input
            type="text"
            placeholder="Search MPs or companies..."
            className="w-full rounded-xl border border-slate-300 bg-white p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          <DashboardCard
            title="MPs"
            value="650"
          />

          <DashboardCard
            title="Companies"
            value="—"
          />

          <DashboardCard
            title="Shareholdings"
            value="—"
          />

          <DashboardCard
            title="Latest Register"
            value="Coming Soon"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}