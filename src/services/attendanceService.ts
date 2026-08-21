// =========================================================================
// AECS ATTENDANCE & BIOMETRIC CLOCK-IN SERVICE
// Official Shift: 10:00 AM – 06:00 PM | Late Arrival Threshold: > 10:15 AM
// =========================================================================

export interface AttendanceRecord {
  id: string;
  empCode: string;
  fullName: string;
  role?: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "PRESENT" | "LATE" | "HALF_DAY" | "ON_LEAVE" | "ABSENT";
  lateMinutes?: number;
  punchInIso?: string;
  punchOutIso?: string;
  totalHoursWorked?: string;
}

export const SHIFT_CONFIG = {
  start: "10:00 AM",
  end: "06:00 PM",
  lateThreshold: "10:15 AM",
  totalHours: 8,
};

export class AttendanceService {
  // 1. Fetch All Attendance Records
  static async getAttendance(): Promise<AttendanceRecord[]> {
    try {
      const res = await fetch("/api/sync/attendance");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  }

  // 2. Clock In / Punch In
  static async punchIn(params: {
    empCode: string;
    fullName: string;
    role: string;
  }): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    try {
      const res = await fetch("/api/sync/attendance/punch-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, record: data.record };
      }
      return { success: false, error: "Failed to punch in" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 3. Clock Out / Punch Out
  static async punchOut(params: {
    empCode: string;
  }): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    try {
      const res = await fetch("/api/sync/attendance/punch-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, record: data.record };
      }
      return { success: false, error: "Failed to punch out" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 4. Helper: Check if current time is considered late (Past 10:15 AM)
  static isCurrentlyLate(): { isLate: boolean; lateMinutes: number } {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const thresholdMinutes = 10 * 60 + 15; // 10:15 AM = 615 mins
    const isLate = currentMinutes > thresholdMinutes;
    const lateMinutes = isLate ? currentMinutes - (10 * 60) : 0;
    return { isLate, lateMinutes };
  }
}
