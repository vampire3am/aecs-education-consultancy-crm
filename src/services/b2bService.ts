export interface B2BPartner {
  id: string;
  code: string; // e.g. B2B-101
  name: string;
  type: "Aggregator" | "Direct University Partner" | "Sub-Agent / Channel Partner" | "Global Recruiter" | "Language & Test Center";
  country: string;
  countryCode: string;
  city?: string;
  photoUrl?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: "Active" | "In progress" | "Agreement Pending" | "Follow-up Due" | "Inactive";
  commissionTerms: string;
  agreementStatus: "Signed MOU" | "Under Review" | "Draft Pending" | "Expired";
  agreementExpiry: string;
  assignedStaff: string;
  nextFollowUp: string;
  referredStudentsCount: number;
  totalPayoutClaimed: string;
  notes: string;
  createdAt: string;
}

type B2BRow = {
  id: string; code: string; name: string; partner_type: B2BPartner["type"]; country: string;
  country_code: string; city: string | null; photo_url: string | null; contact_person: string;
  contact_email: string; contact_phone: string; status: B2BPartner["status"];
  commission_terms: string; agreement_status: B2BPartner["agreementStatus"];
  agreement_expiry: string | null; assigned_staff: string; next_follow_up: string | null;
  referred_students_count: number; total_payout_claimed: string; notes: string; created_at: string;
};

const fromRow = (row: B2BRow): B2BPartner => ({
  id: row.id, code: row.code, name: row.name, type: row.partner_type, country: row.country,
  countryCode: row.country_code, city: row.city ?? "", photoUrl: row.photo_url ?? "",
  contactPerson: row.contact_person, contactEmail: row.contact_email, contactPhone: row.contact_phone,
  status: row.status, commissionTerms: row.commission_terms, agreementStatus: row.agreement_status,
  agreementExpiry: row.agreement_expiry ?? "", assignedStaff: row.assigned_staff,
  nextFollowUp: row.next_follow_up ?? "", referredStudentsCount: row.referred_students_count,
  totalPayoutClaimed: row.total_payout_claimed, notes: row.notes, createdAt: row.created_at,
});

const toRow = (partner: B2BPartner) => ({
  id: partner.id, code: partner.code, name: partner.name, partner_type: partner.type,
  country: partner.country, country_code: partner.countryCode, city: partner.city || null,
  photo_url: partner.photoUrl || "", contact_person: partner.contactPerson,
  contact_email: partner.contactEmail, contact_phone: partner.contactPhone, status: partner.status,
  commission_terms: partner.commissionTerms, agreement_status: partner.agreementStatus,
  agreement_expiry: partner.agreementExpiry || null, assigned_staff: partner.assignedStaff,
  next_follow_up: partner.nextFollowUp || null, referred_students_count: partner.referredStudentsCount,
  total_payout_claimed: partner.totalPayoutClaimed, notes: partner.notes,
});

export const B2BService = {
  getPartners: async (): Promise<B2BPartner[]> => {
    const { data, error } = await supabase.from("b2b_partners").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as B2BRow[]).map(fromRow);
  },

  createPartner: async (partner: Omit<B2BPartner, "id" | "code" | "createdAt">): Promise<B2BPartner> => {
    const { data: code, error: codeError } = await supabase.rpc("next_b2b_code");
    if (codeError) throw codeError;
    const newPartner: B2BPartner = {
      ...partner,
      id: crypto.randomUUID(),
      code: code as string,
      createdAt: new Date().toISOString(),
    };
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("b2b_partners").insert({ ...toRow(newPartner), created_by: auth.user?.id ?? null });
    if (error) throw error;
    return newPartner;
  },

  updatePartner: async (id: string, patch: Partial<B2BPartner>): Promise<B2BPartner | null> => {
    const { data, error: readError } = await supabase.from("b2b_partners").select("*").eq("id", id).maybeSingle();
    if (readError) throw readError;
    if (!data) return null;
    const updated = { ...fromRow(data as B2BRow), ...patch } as B2BPartner;
    const { id: _id, code: _code, ...changes } = toRow(updated);
    void _id; void _code;
    const { error } = await supabase.from("b2b_partners").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    return updated;
  },

  deletePartner: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("b2b_partners").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  exportCsv: (partners: B2BPartner[]) => {
    const headers = [
      "ID",
      "Partner Name",
      "Type",
      "Country",
      "City",
      "Contact Person",
      "Contact Email",
      "Contact Phone",
      "Status",
      "Commission Terms",
      "Agreement Status",
      "Agreement Expiry",
      "Staff Owner",
      "Next Follow-up",
      "Referred Students",
      "Payout Claimed",
    ];

    const rows = partners.map(p => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.type}"`,
      `"${p.country}"`,
      `"${p.city || ""}"`,
      `"${p.contactPerson.replace(/"/g, '""')}"`,
      `"${p.contactEmail}"`,
      `"${p.contactPhone}"`,
      `"${p.status}"`,
      `"${p.commissionTerms.replace(/"/g, '""')}"`,
      `"${p.agreementStatus}"`,
      `"${p.agreementExpiry}"`,
      `"${p.assignedStaff}"`,
      `"${p.nextFollowUp}"`,
      p.referredStudentsCount,
      `"${p.totalPayoutClaimed}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AECS_B2B_Partners_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
import { supabase } from "../lib/supabase";
