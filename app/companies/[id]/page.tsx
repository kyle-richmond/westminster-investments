import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: company, error } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      shareholdings (
        id,
        value,
        company_name_raw,
        politicians (
          id,
          name,
          party,
          constituency
        ),
        interests (
          id,
          summary,
          date_registered
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !company) {
    return <main className="p-8">Company not found.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-8 py-12">
        <Link href="/companies" className="text-sm text-blue-700">
          ← Back to Companies
        </Link>

        <h1 className="mt-6 text-4xl font-bold text-slate-900">
          {company.name}
        </h1>

        <p className="mt-3 text-slate-600">
          MPs declaring a shareholding in this company or organisation.
        </p>

        <div className="mt-8 space-y-4">
          {company.shareholdings?.map((holding: any) => (
            <div
              key={holding.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Link
                href={`/mps/${holding.politicians.id}`}
                className="text-lg font-semibold text-blue-700"
              >
                {holding.politicians.name}
              </Link>

              <p className="mt-1 text-slate-600">
                {holding.politicians.party} · {holding.politicians.constituency}
              </p>

              {holding.value && (
                <p className="mt-3 text-sm text-slate-700">
                  Threshold: {holding.value}
                </p>
              )}

              {holding.interests?.summary && (
                <p className="mt-3 text-slate-900">
                  {holding.interests.summary}
                </p>
              )}

              {holding.interests?.date_registered && (
                <p className="mt-3 text-sm text-slate-500">
                  Registered: {holding.interests.date_registered}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}