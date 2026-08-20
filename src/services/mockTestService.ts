export interface MockTestResult {
  id: string;
  testCode: string; // e.g. MOCK-2026-0815
  studentName: string;
  studentCode: string; // e.g. CLS-2026-001 or AECS-2026-00001
  testType: "IELTS Academic" | "PTE Academic" | "Duolingo (DET)" | "German A1" | "JLPT N5" | "TOEFL iBT";
  testDate: string;
  venue: string;
  examiner: string;

  // Sectional Scores
  listening: string | number; // e.g. 7.5 or 68
  reading: string | number;   // e.g. 6.5 or 62
  writing: string | number;   // e.g. 6.5 or 65
  speaking: string | number;  // e.g. 7.0 or 72
  overallScore: string;       // e.g. "7.0 Band" or "67 / 90"

  status: "Score Issued" | "Pending Evaluation" | "Absent" | "Scheduled";
  examinerFeedback: string;
  targetAchieved: boolean;
  createdAt: string;
}

export interface MockTestSlot {
  id: string;
  title: string;
  testType: "IELTS Academic" | "PTE Academic" | "Duolingo (DET)" | "German A1" | "JLPT N5";
  date: string;
  time: string;
  room: string;
  invigilator: string;
  bookedSeats: number;
  totalSeats: number;
  status: "OPEN" | "FULL" | "COMPLETED";
}

const RESULTS_KEY = "aecs_mock_test_results_v2";
const SLOTS_KEY = "aecs_mock_test_slots_v2";

const INITIAL_MOCK_RESULTS: MockTestResult[] = [];

const INITIAL_MOCK_SLOTS: MockTestSlot[] = [];

export const MockTestService = {
  getResults: async (): Promise<MockTestResult[]> => {
    const saved = localStorage.getItem(RESULTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_MOCK_RESULTS;
  },

  saveResults: (results: MockTestResult[]) => {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  },

  getSlots: async (): Promise<MockTestSlot[]> => {
    const saved = localStorage.getItem(SLOTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_MOCK_SLOTS;
  },

  saveSlots: (slots: MockTestSlot[]) => {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  },

  createResult: async (res: Omit<MockTestResult, "id" | "testCode" | "createdAt">): Promise<MockTestResult> => {
    const current = await MockTestService.getResults();
    const nextNum = String(current.length + 1).padStart(2, "0");
    const testCode = `MOCK-2026-${res.testDate.replace(/-/g, "").substring(4)}-${nextNum}`;
    const newRes: MockTestResult = {
      ...res,
      id: `m-${Date.now()}`,
      testCode: testCode,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newRes, ...current];
    MockTestService.saveResults(updated);
    return newRes;
  },

  createSlot: async (slot: Omit<MockTestSlot, "id">): Promise<MockTestSlot> => {
    const current = await MockTestService.getSlots();
    const newSlot: MockTestSlot = {
      ...slot,
      id: `slot-${Date.now()}`,
    };
    const updated = [newSlot, ...current];
    MockTestService.saveSlots(updated);
    return newSlot;
  },
};
