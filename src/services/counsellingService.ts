import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface CounsellingRecord {
  id: string;
  studentName: string;
  studentCode: string;
  counsellorName: string;
  consultationDate: string;
  targetCountry: string;
  preferredCourse: string;
  stageOutcome: "Eligible for Direct Entry" | "Language Prep Required" | "Financial Documentation Review" | "University Shortlisted" | "On Hold";
  followUpDate: string;
  notes: string;
}

const STORAGE_KEY = "aecs_persistent_counselling";

const DEFAULT_COUNSELLING_RECORDS: CounsellingRecord[] = [];

export const CounsellingService = {
  getRecords: async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Use default
      }
    }
    return DEFAULT_COUNSELLING_RECORDS;
  },

  createRecord: async (record: Omit<CounsellingRecord, "id">) => {
    const newRecord: CounsellingRecord = {
      ...record,
      id: `c-${Date.now()}`,
    };
    const current = await CounsellingService.getRecords();
    const updated = [newRecord, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("counselling_records").insert({
          notes: record.notes,
          follow_up_date: record.followUpDate,
        });
      } catch (err) {
        console.warn("Supabase background sync deferred:", err);
      }
    }

    return newRecord;
  },
};
