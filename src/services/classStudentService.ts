export interface ClassStudent {
  id: string;
  studentCode: string; // e.g. CLS-2026-001
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  gender?: "Male" | "Female" | "Other";
  educationLevel?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  recordStatus: "Active" | "Completed" | "On Hold" | "Dropped";
  notes?: string;

  // First class enrolment
  enrolledClass: "IELTS Preparation" | "PTE Academic" | "Duolingo (DET)" | "TOEFL iBT" | "German Language (A1/A2)" | "Japanese (NAT/JLPT)" | "Korean (TOPIK)";
  teacher: string;
  startDate: string;
  expectedCompletion: string;
  batchName: string;
  schedule: string;
  mode: "Classroom" | "Online" | "Hybrid";
  classStatus: "Active" | "Completed" | "Transferred" | "On Hold";
  enrolmentNotes?: string;
  feePaid: string;
  createdAt: string;
}

const STORAGE_KEY = "aecs_class_students_v2";

const INITIAL_CLASS_STUDENTS: ClassStudent[] = [];

export const ClassStudentService = {
  getStudents: async (): Promise<ClassStudent[]> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CLASS_STUDENTS;
  },

  saveStudents: (students: ClassStudent[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  },

  createStudent: async (student: Omit<ClassStudent, "id" | "studentCode" | "createdAt">): Promise<ClassStudent> => {
    const current = await ClassStudentService.getStudents();
    const nextCode = `CLS-2026-${String(current.length + 1).padStart(3, "0")}`;
    const newStudent: ClassStudent = {
      ...student,
      id: `cls-${Date.now()}`,
      studentCode: nextCode,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newStudent, ...current];
    ClassStudentService.saveStudents(updated);
    return newStudent;
  },

  updateStudent: async (id: string, patch: Partial<ClassStudent>): Promise<ClassStudent | null> => {
    const current = await ClassStudentService.getStudents();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) return null;
    current[index] = { ...current[index], ...patch };
    ClassStudentService.saveStudents(current);
    return current[index];
  },

  deleteStudent: async (id: string): Promise<boolean> => {
    const current = await ClassStudentService.getStudents();
    const updated = current.filter(s => s.id !== id);
    ClassStudentService.saveStudents(updated);
    return true;
  },
};
