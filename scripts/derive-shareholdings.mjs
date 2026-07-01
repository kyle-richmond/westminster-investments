import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function normalizeCompanyName(name) {
  return name
    .toLowerCase()
    .replace(/\bplc\b/g, "")
    .replace(/\blimited\b/g, "")
    .replace(/\bltd\b/g, "")
    .replace(/\bllp\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getField(fields, name) {
  return fields.find((field) => field.field_name === name)?.field_value ?? null;
}

async function fetchAllShareholdingInterests() {
  const all = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("interests")
      .select("id, politician_id, summary, date_registered, interest_fields(*)")
      .eq("category", "Shareholdings")
      .range(from, to);

    if (error) throw error;

    all.push(...(data ?? []));

    if (!data || data.length < pageSize) break;

    from += pageSize;
  }

  return all;
}

async function main() {
  console.log("Clearing derived shareholding tables...");

  await supabase.from("shareholdings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("companies").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Fetching shareholding interests...");

  const interests = await fetchAllShareholdingInterests();

  console.log(`Found ${interests.length} shareholding interests`);

  let inserted = 0;
  let skipped = 0;

  for (const interest of interests) {
    const fields = interest.interest_fields ?? [];

    const companyName = getField(fields, "OrganisationName");
    const organisationDescription = getField(fields, "OrganisationDescription");
    const threshold = getField(fields, "ShareholdingThreshold");
    const registrableDate = getField(fields, "RegistrableDate");
    const endDate = getField(fields, "EndDate");

    if (!companyName) {
      console.log("Skipping: no OrganisationName", interest.summary);
      skipped++;
      continue;
    }

    const normalizedName = normalizeCompanyName(companyName);

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .upsert(
        {
          name: companyName,
          normalized_name: normalizedName,
        },
        { onConflict: "normalized_name" }
      )
      .select()
      .single();

    if (companyError) throw companyError;

    const { error: shareholdingError } = await supabase
      .from("shareholdings")
      .insert({
        politician_id: interest.politician_id,
        interest_id: interest.id,
        company_id: company.id,
        company_name_raw: companyName,
        value: threshold,
      });

    if (shareholdingError) throw shareholdingError;

    inserted++;
  }

  console.log(`Done. Inserted ${inserted} shareholdings. Skipped ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});