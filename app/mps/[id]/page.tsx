import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function MPProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: mp, error: mpError } = await supabase
    .from("politicians")
    .select("*")
    .eq("id", id)
    .single();

  if (mpError || !mp) {
    return <main className="p-8">MP not found.</main>;
  }

  const { data: interests, error: interestsError } = await supabase
    .from("interests")
    .select("*, interest_fields(*)")
    .eq("politician_id", id)
    .order("category");

  if (interestsError) {
    return <main className="p-8">Error: {interestsError.message}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-8 py-12">
        <Link href="/mps" className="text-sm text-blue-700">
          ← Back to MPs
        </Link>

        <h1 className="mt-6 text-4xl font-bold text-slate-900">{mp.name}</h1>

        <p className="mt-2 text-lg text-slate-600">
          {mp.party} · {mp.constituency}
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-slate-900">
          Declared interests
        </h2>

        <div className="mt-6 space-y-4">
          {interests?.map((interest) => (
            <div
              key={interest.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                {interest.category}
              </p>

              <p className="mt-2 text-slate-900">{interest.summary}</p>

              {interest.interest_fields?.length > 0 && (
                <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                  {interest.interest_fields
  .filter((field: any) => field.field_value && field.field_value !== "null")
  .map((field: any) => (
                    <div key={field.id}>
                      <dt className="text-sm font-medium text-slate-500">
                        {field.field_name}
                      </dt>
                      <dd className="text-sm text-slate-900">
                        {field.field_value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {interest.date_registered && (
                <p className="mt-3 text-sm text-slate-500">
                  Registered: {interest.date_registered}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}