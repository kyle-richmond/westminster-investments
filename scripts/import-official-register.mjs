import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const API = "https://interests-api.parliament.uk/api/v1";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

function flattenFields(fields) {
  const rows = [];

  for (const field of fields ?? []) {
    if (field.value !== null && field.value !== undefined) {
      rows.push({
        field_name: field.name,
        field_description: field.description,
        field_type: field.type,
        field_value: String(field.value),
      });
    }

    if (Array.isArray(field.values)) {
      for (const group of field.values) {
        for (const nestedField of group) {
          rows.push({
            field_name: nestedField.name,
            field_description: nestedField.description,
            field_type: nestedField.type,
            field_value:
              nestedField.value !== null && nestedField.value !== undefined
                ? String(nestedField.value)
                : null,
          });
        }
      }
    }
  }

  return rows;
}

async function main() {
  console.log("Fetching latest register...");

  const registers = await fetchJson(`${API}/Registers?Take=1`);
  const latestRegister = registers.items[0];

  console.log("Latest register:", latestRegister);

  const { data: publication, error: publicationError } = await supabase
    .from("register_publications")
    .insert({
      publication_date: latestRegister.publishedDate,
      source_url: `${API}/Registers/${latestRegister.id}`,
    })
    .select()
    .single();

  if (publicationError) throw publicationError;

  let skip = 0;
  const take = 20;
  let total = Infinity;
  let imported = 0;

  while (skip < total) {
    const url = `${API}/Interests?RegisterId=${latestRegister.id}&Take=${take}&Skip=${skip}`;
    const page = await fetchJson(url);

    total = page.totalResults;
    console.log(`Fetched ${skip + page.items.length} / ${total}`);

    for (const item of page.items) {
      const member = item.member;
      const category = item.category;

      await supabase.from("categories").upsert({
        id: category.id,
        number: category.number,
        name: category.name,
        type: category.type,
      });

      const { data: politician, error: politicianError } = await supabase
        .from("politicians")
        .upsert(
          {
            parliament_member_id: String(member.id),
            name: member.nameDisplayAs,
            party: member.party,
            constituency: member.memberFrom,
            house: member.house,
            active: true,
          },
          { onConflict: "parliament_member_id" }
        )
        .select()
        .single();

      if (politicianError) throw politicianError;

      const { data: interest, error: interestError } = await supabase
        .from("interests")
        .insert({
          politician_id: politician.id,
          publication_id: publication.id,
          category: category.name,
          summary: item.summary,
          raw_text: item.summary ?? "",
          date_registered: item.registrationDate,
        })
        .select()
        .single();

      if (interestError) throw interestError;

      const flattenedFields = flattenFields(item.fields);

      if (flattenedFields.length > 0) {
        const { error: fieldError } = await supabase
          .from("interest_fields")
          .insert(
            flattenedFields.map((field) => ({
              interest_id: interest.id,
              ...field,
            }))
          );

        if (fieldError) throw fieldError;
      }

      imported++;
    }

    skip += take;
  }

  console.log(`Done. Imported ${imported} interests.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});