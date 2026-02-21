import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import { resolveUniqueSlugFromExisting } from "@/lib/utils/slug-collision";

export async function ensureUniqueEventSlug(title: string) {
  const base = slugify(title || "event", 72) || "event";
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("events")
    .select("slug")
    .ilike("slug", `${base}%`)
    .limit(200);

  return resolveUniqueSlugFromExisting(
    base,
    (existing || []).map((item: { slug: string }) => item.slug)
  );
}

