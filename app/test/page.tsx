import { supabase } from "../../lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase.from("test").select("*");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Supabase error</h1>
        <pre className="mt-4">{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Supabase test</h1>
      <pre className="mt-4">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}