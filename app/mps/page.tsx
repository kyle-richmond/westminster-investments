import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function MPsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let query = supabase
    .from("politicians")
    .select("*")
    .order("name");

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,party.ilike.%${q}%,constituency.ilike.%${q}%`
    );
  }

  const { data: politicians, error } = await query;

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h1 className="text-4xl font-bold text-slate-900">MPs</h1>

        <p className="mt-3 text-slate-600">
          Browse MPs and their declared financial interests.
        </p>

        <form className="mt-8">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by MP, party, or constituency..."
            className="w-full rounded-xl border border-slate-300 bg-white p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <p className="mt-4 text-sm text-slate-500">
          Showing {politicians?.length ?? 0} MPs
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Party</th>
                <th className="px-6 py-4">Constituency</th>
              </tr>
            </thead>

            <tbody>
              {politicians?.map((mp) => (
                <tr key={mp.id} className="border-t border-slate-200">
                  <td className="px-6 py-4 font-medium text-blue-700">
                    <Link href={`/mps/${mp.id}`}>{mp.name}</Link>
                  </td>
                  <td className="px-6 py-4">{mp.party}</td>
                  <td className="px-6 py-4">{mp.constituency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}