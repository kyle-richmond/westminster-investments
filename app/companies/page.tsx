import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let query = supabase.from("companies").select(`
    id,
    name,
    shareholdings (
      id,
      politicians (
        id,
        name,
        party,
        constituency
      )
    )
  `);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: companies, error } = await query;

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  const sortedCompanies = companies?.sort((a: any, b: any) => {
    const aShareholders = new Set(
      a.shareholdings?.map((s: any) => s.politicians?.id)
    ).size;

    const bShareholders = new Set(
      b.shareholdings?.map((s: any) => s.politicians?.id)
    ).size;

    const aHoldings = a.shareholdings?.length ?? 0;
    const bHoldings = b.shareholdings?.length ?? 0;

    return (
      bShareholders - aShareholders ||
      bHoldings - aHoldings ||
      a.name.localeCompare(b.name)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h1 className="text-4xl font-bold text-slate-900">Companies</h1>

        <p className="mt-3 text-slate-600">
          Companies in which MPs have declared shareholdings.
        </p>

        <form className="mt-8">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search companies, e.g. Lloyds, Rolls, Shell..."
            className="w-full rounded-xl border border-slate-300 bg-white p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <p className="mt-4 text-sm text-slate-500">
          Showing {sortedCompanies?.length ?? 0} companies
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">MP shareholders</th>
                <th className="px-6 py-4">Holdings</th>
              </tr>
            </thead>

            <tbody>
              {sortedCompanies?.map((company: any) => {
                const uniquePoliticians = new Set(
                  company.shareholdings?.map((s: any) => s.politicians?.id)
                );

                return (
                  <tr key={company.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium text-blue-700">
                      <Link href={`/companies/${company.id}`}>
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{uniquePoliticians.size}</td>
                    <td className="px-6 py-4">
                      {company.shareholdings?.length ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}