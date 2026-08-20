import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface StudentPayload {
  id?: string;
  code?: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  address?: string;
  targetCountry: string;
  targetCourse: string;
  targetIntake?: string;
  budget?: string;
  counsellor?: string;
  status?: "NEW_LEAD" | "COUNSELLING" | "APPLICATION_SUBMITTED" | "OFFER_RECEIVED" | "VISA_PROCESSING" | "ENROLLED";
}

export interface LeadRecord {
  id: string;
  leadCode: string;
  fullName: string;
  email: string;
  phone: string;
  source: "Facebook / Instagram Ads" | "Google Search" | "Walk-in Inquiry" | "Education Fair 2026" | "Student Referral" | "TikTok / Social";
  targetCountry: "UK" | "Australia" | "Canada" | "USA" | "Germany" | "New Zealand";
  targetCourse: string;
  targetIntake: string;
  budgetEstimate: string;
  assignedCounsellor: string;
  stage: "NEW_INQUIRY" | "CONTACTED" | "COUNSELLING_SCHEDULED" | "HOT_PROSPECT" | "CONVERTED" | "LOST";
  priority: "HIGH" | "MEDIUM" | "LOW";
  lastContactDate: string;
  notes: string[];
  createdAt: string;
}

const STORAGE_STUDENTS = "aecs_persistent_students";
const STORAGE_LEADS = "aecs_persistent_leads";

const DEFAULT_LEADS: LeadRecord[] = [];

const DEFAULT_STUDENTS: any[] = [];

export const StudentService = {
  getStudents: async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*, study_preferences(*), academic_information(*), staff_profiles(full_name)")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn("Falling back to local reactive storage for students:", err);
      }
    }

    const saved = localStorage.getItem(STORAGE_STUDENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Return default
      }
    }
    return DEFAULT_STUDENTS;
  },

  createStudent: async (payload: StudentPayload) => {
    const nextCode = `AECS-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const nextId = `std-${Date.now()}`;

    const newRecord = {
      id: nextId,
      code: nextCode,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      dob: payload.dob || "2003-01-01",
      gender: payload.gender || "Female",
      address: payload.address || "Kathmandu, Nepal",
      status: payload.status || "COUNSELLING",
      targetCountry: payload.targetCountry || "UK",
      targetCourse: payload.targetCourse || "Higher Education",
      targetIntake: payload.targetIntake || "September 2026",
      budget: payload.budget || "NPR 25-30 Lakhs",
      counsellor: payload.counsellor || "Sita Adhikari",
      englishTest: { test: "Enquiry in Progress", score: "Pending assessment" },
      academicSummary: "Profile registered via AECS intake portal",
      documentsVerified: 1,
      documentsTotal: 10,
      notes: ["Registered student profile created in AECS CRM."],
      createdAt: "Just now",
    };

    const currentList = await StudentService.getStudents();
    const updated = [newRecord, ...currentList];
    localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(updated));

    return newRecord;
  },

  updateStatus: async (studentId: string, status: string) => {
    const currentList = await StudentService.getStudents();
    const updated = currentList.map((s: any) =>
      s.id === studentId ? { ...s, status } : s
    );
    localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(updated));
    return updated;
  },

  deleteStudent: async (studentId: string) => {
    const currentList = await StudentService.getStudents();
    const updated = currentList.filter((s: any) => s.id !== studentId);
    localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(updated));
    return updated;
  },
};

export const LeadService = {
  getLeads: async (): Promise<LeadRecord[]> => {
    const saved = localStorage.getItem(STORAGE_LEADS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Return default
      }
    }
    return DEFAULT_LEADS;
  },

  createLead: async (payload: Omit<LeadRecord, "id" | "leadCode" | "createdAt" | "lastContactDate" | "notes">): Promise<LeadRecord> => {
    const nextCode = `LEAD-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const newLead: LeadRecord = {
      ...payload,
      id: `lead-${Date.now()}`,
      leadCode: nextCode,
      lastContactDate: "Just now",
      notes: ["Initial prospect inquiry recorded in Leads Hub."],
      createdAt: "Just now",
    };

    const current = await LeadService.getLeads();
    const updated = [newLead, ...current];
    localStorage.setItem(STORAGE_LEADS, JSON.stringify(updated));
    return newLead;
  },

  updateLeadStage: async (leadId: string, stage: LeadRecord["stage"]) => {
    const current = await LeadService.getLeads();
    const updated = current.map(l => (l.id === leadId ? { ...l, stage } : l));
    localStorage.setItem(STORAGE_LEADS, JSON.stringify(updated));
    return updated;
  },

  convertLeadToStudent: async (lead: LeadRecord) => {
    // 1. Create official student record
    const student = await StudentService.createStudent({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      dob: "2003-01-01",
      gender: "Female",
      targetCountry: lead.targetCountry,
      targetCourse: lead.targetCourse,
      targetIntake: lead.targetIntake,
      budget: lead.budgetEstimate,
      counsellor: lead.assignedCounsellor,
      status: "COUNSELLING",
    });

    // 2. Mark lead as CONVERTED
    await LeadService.updateLeadStage(lead.id, "CONVERTED");

    return student;
  },
};
