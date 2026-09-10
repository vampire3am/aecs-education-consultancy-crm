import { supabase } from "../lib/supabase";
import type { PartnerUniversity } from "../features/counselling/CounsellingDashboard";

type UniversityRow = {
  id: string;
  country_code: string;
  country: string;
  name: string;
  payload: Partial<PartnerUniversity>;
};

const fromRow = (row: UniversityRow): PartnerUniversity => ({
  id: row.id,
  name: row.name,
  city: "",
  country: row.country,
  countryCode: row.country_code,
  ranking: "",
  popularCourses: [],
  minPte: "",
  minIelts: "",
  scholarship: "",
  tuition: "",
  intake: "",
  ...row.payload,
});

export const UniversityCatalogService = {
  async list(): Promise<PartnerUniversity[]> {
    const { data, error } = await supabase.from("partner_university_catalog").select("*").order("name");
    if (error) throw error;
    return ((data ?? []) as UniversityRow[]).map(fromRow);
  },
  async save(item: PartnerUniversity): Promise<void> {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("partner_university_catalog").upsert({
      id: item.id,
      country_code: item.countryCode.toUpperCase(),
      country: item.country,
      name: item.name,
      payload: item,
      created_by: auth.user?.id ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },
  async saveMany(items: PartnerUniversity[]): Promise<void> {
    for (const item of items) await this.save(item);
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("partner_university_catalog").delete().eq("id", id);
    if (error) throw error;
  },
};
