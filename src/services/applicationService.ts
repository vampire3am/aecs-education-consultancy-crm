export interface UniversityApplication {
  id: string;
  studentCode: string;
  studentName: string;
  universityName: string;
  country: "UK" | "Australia" | "Canada" | "USA" | "Germany" | "New Zealand" | "Finland" | "Ireland" | "Japan";
  countryCode: "GB" | "AU" | "CA" | "US" | "DE" | "NZ" | "FI" | "IE" | "JP";
  course: string;
  intake: string;
  stage: "SUBMITTED" | "CONDITIONAL_OFFER" | "UNCONDITIONAL_OFFER" | "CAS_ISSUED" | "VISA_LODGED" | "VISA_APPROVED";
  deadline: string;
  officer: string;
  tuitionFee: string;
  scholarship: string;
  appliedDate?: string;
  notes?: string;
}

const STORAGE_KEY = "aecs_persistent_applications_v3";

export const DEFAULT_APPLICATIONS: UniversityApplication[] = [];

export const ApplicationService = {
  getApplications: async (): Promise<UniversityApplication[]> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_APPLICATIONS;
  },

  saveApplications: (apps: UniversityApplication[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  },

  createApplication: async (payload: Omit<UniversityApplication, "id">): Promise<UniversityApplication> => {
    const newRecord: UniversityApplication = {
      ...payload,
      id: `app-${Date.now()}`,
    };
    const current = await ApplicationService.getApplications();
    const updated = [newRecord, ...current];
    ApplicationService.saveApplications(updated);
    return newRecord;
  },

  updateApplicationStage: async (
    id: string,
    newStage: UniversityApplication["stage"]
  ): Promise<UniversityApplication[]> => {
    const current = await ApplicationService.getApplications();
    const updated = current.map(app => (app.id === id ? { ...app, stage: newStage } : app));
    ApplicationService.saveApplications(updated);
    return updated;
  },

  deleteApplication: async (id: string): Promise<boolean> => {
    const current = await ApplicationService.getApplications();
    const updated = current.filter(app => app.id !== id);
    ApplicationService.saveApplications(updated);
    return true;
  },

  exportCsv: (apps: UniversityApplication[]) => {
    const headers = [
      "Student Code",
      "Student Name",
      "Target University",
      "Destination Country",
      "Degree / Course",
      "Intake Cycle",
      "Tuition Fee",
      "Scholarship",
      "Status Stage",
      "Application Officer",
      "Deadline",
    ];

    const rows = apps.map(a => [
      `"${a.studentCode}"`,
      `"${a.studentName.replace(/"/g, '""')}"`,
      `"${a.universityName.replace(/"/g, '""')}"`,
      `"${a.country}"`,
      `"${a.course.replace(/"/g, '""')}"`,
      `"${a.intake}"`,
      `"${a.tuitionFee}"`,
      `"${a.scholarship.replace(/"/g, '""')}"`,
      `"${a.stage}"`,
      `"${a.officer}"`,
      `"${a.deadline}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AECS_University_Applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
