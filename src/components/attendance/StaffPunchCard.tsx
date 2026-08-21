import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  Sparkles,
  Timer,
  UserCheck,
  UserX,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/AuthProvider";
import {
  type AttendanceRecord,
  AttendanceService,
  SHIFT_CONFIG,
} from "../../services/attendanceService";

export function StaffPunchCard() {
  const { profile } = useAuth();
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [punchMessage, setPunchMessage] = useState<string | null>(null);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Attendance Records & Poll
  const loadAttendance = async () => {
    const data = await AttendanceService.getAttendance();
    setAttendanceList(data);
  };

  useEffect(() => {
    loadAttendance();
    const interval = setInterval(loadAttendance, 4000);
    return () => clearInterval(interval);
  }, []);

  // Check if current user has punched in/out today
  const todayStr = useMemo(
    () => currentTime.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    [currentTime]
  );

  const staffNum = profile?.id ? profile.id.replace(/\D/g, "") || "3" : "3";
  const myEmpCode = `AECS-EMP-00${staffNum}`;

  const myRecord = useMemo(() => {
    return attendanceList.find(
      a =>
        (a.empCode === myEmpCode || a.fullName === profile?.full_name) &&
        (a.date.includes(todayStr) || a.date.startsWith("Today"))
    );
  }, [attendanceList, myEmpCode, profile, todayStr]);

  // Is Late Calculation (Official shift: 10:00 AM – 06:00 PM. Past 10:15 AM is LATE)
  const isLateNow = useMemo(() => {
    const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const threshold = 10 * 60 + 15; // 10:15 AM
    return mins > threshold;
  }, [currentTime]);

  const currentLateMinutes = useMemo(() => {
    const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
    return Math.max(0, mins - 10 * 60);
  }, [currentTime]);

  // Handle Punch In
  const handlePunchIn = async () => {
    if (!profile) return;
    setLoading(true);
    const res = await AttendanceService.punchIn({
      empCode: myEmpCode,
      fullName: profile.full_name || "Staff Member",
      role: profile.job_title || profile.role || "Staff",
    });
    setLoading(false);
    if (res.success) {
      setPunchMessage(
        isLateNow
          ? `⚠️ Punched In (LATE by ${currentLateMinutes} mins) at ${currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : `✅ Punched In ON TIME at ${currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      );
      loadAttendance();
      setTimeout(() => setPunchMessage(null), 5000);
    }
  };

  // Handle Punch Out
  const handlePunchOut = async () => {
    setLoading(true);
    const res = await AttendanceService.punchOut({
      empCode: myEmpCode,
    });
    setLoading(false);
    if (res.success) {
      setPunchMessage(
        `👋 Shift Complete! Punched Out at ${currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      );
      loadAttendance();
      setTimeout(() => setPunchMessage(null), 5000);
    }
  };

  // Check if current user is the Owner/Director (Exempt from mandatory punch-in, sees Executive Radar)
  const isOwner = profile?.role === "ADMIN" || profile?.job_title?.toLowerCase().includes("owner");

  if (isOwner) {
    const presentCount = attendanceList.filter(a => a.status === "PRESENT").length;
    const lateCount = attendanceList.filter(a => a.status === "LATE").length;

    return (
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          color: "#FFFFFF",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ padding: "4px 8px", background: "rgba(37, 99, 235, 0.3)", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
                EXECUTIVE RADAR
              </span>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                Shift: {SHIFT_CONFIG.start} – {SHIFT_CONFIG.end} · Late after {SHIFT_CONFIG.lateThreshold}
              </span>
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>
              🏢 Today's Staff Attendance Radar
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#6EE7B7", display: "block", fontWeight: 600 }}>On Time</span>
              <strong style={{ fontSize: "18px", color: "#FFFFFF" }}>{presentCount}</strong>
            </div>

            <div style={{ background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#FCD34D", display: "block", fontWeight: 600 }}>Late Arrivals</span>
              <strong style={{ fontSize: "18px", color: "#FFFFFF" }}>{lateCount}</strong>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#94A3B8", display: "block", fontWeight: 600 }}>Total Punched</span>
              <strong style={{ fontSize: "18px", color: "#FFFFFF" }}>{attendanceList.length}</strong>
            </div>
          </div>
        </div>

        {/* Live Staff Badges Strip */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          {attendanceList.map(att => (
            <div
              key={att.id}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${att.status === "LATE" ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.3)"}`,
                borderRadius: "10px",
                padding: "8px 14px",
                minWidth: "160px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong style={{ fontSize: "12.5px", color: "#FFFFFF" }}>{att.fullName}</strong>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: att.status === "LATE" ? "#F59E0B" : "#10B981",
                    color: "#FFFFFF",
                  }}
                >
                  {att.status}
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                In: {att.checkIn} {att.lateMinutes ? `(+${att.lateMinutes}m)` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MANDATORY PUNCH-IN / PUNCH-OUT CARD FOR ALL STAFF (EXCEPT OWNER)
  // =========================================================================
  const isPunchedIn = Boolean(myRecord && myRecord.checkIn);
  const isPunchedOut = Boolean(myRecord && myRecord.checkOut && myRecord.checkOut !== "In Office");

  return (
    <div
      style={{
        background: "var(--bg-card, #FFFFFF)",
        border: "1px solid var(--border-subtle, #E2E8F0)",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Accent Ribbon */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: isPunchedOut
            ? "#64748B"
            : isPunchedIn
            ? myRecord?.status === "LATE"
              ? "#F59E0B"
              : "#10B981"
            : isLateNow
            ? "#F59E0B"
            : "#2563EB",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        {/* Left Side: Shift Info & Live Clock */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(37, 99, 235, 0.1)",
                color: "#2563EB",
                textTransform: "uppercase",
              }}
            >
              MANDATORY ATTENDANCE
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted, #64748B)", fontWeight: 600 }}>
              ⏰ Official Shift: 10:00 AM – 06:00 PM (Late after 10:15 AM)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-main, #0F172A)" }}>
              {profile?.full_name}
            </h3>
            <span style={{ fontSize: "13px", color: "var(--text-muted, #64748B)" }}>
              ({profile?.job_title || profile?.role || "Staff Member"} · {myEmpCode})
            </span>
          </div>
        </div>

        {/* Center: Live Digital Kathmandu Clock */}
        <div
          style={{
            background: "var(--bg-app, #F8FAFC)",
            border: "1px solid var(--border-subtle, #E2E8F0)",
            borderRadius: "12px",
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Clock size={18} style={{ color: "var(--accent-blue, #2563EB)" }} />
          <div>
            <span style={{ fontSize: "10.5px", color: "var(--text-muted, #64748B)", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
              Kathmandu Live Time
            </span>
            <strong style={{ fontSize: "16px", fontFamily: "monospace", color: "var(--text-main, #0F172A)" }}>
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </strong>
          </div>
        </div>

        {/* Right Side: Punch In / Punch Out Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!isPunchedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isLateNow && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#D97706", fontSize: "12px", fontWeight: 600 }}>
                  <AlertTriangle size={15} />
                  <span>Late Arrival (+{currentLateMinutes}m)</span>
                </div>
              )}
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handlePunchIn}
                style={{
                  background: isLateNow
                    ? "linear-gradient(135deg, #D97706 0%, #B45309 100%)"
                    : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  border: "none",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: isLateNow
                    ? "0 4px 14px rgba(217, 119, 6, 0.3)"
                    : "0 4px 14px rgba(16, 185, 129, 0.3)",
                }}
              >
                <CheckCircle2 size={16} />
                <span>{loading ? "Recording…" : "PUNCH IN / CLOCK IN"}</span>
              </button>
            </div>
          ) : !isPunchedOut ? (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: myRecord?.status === "LATE" ? "#FEF3C7" : "#DCFCE7",
                    color: myRecord?.status === "LATE" ? "#B45309" : "#15803D",
                  }}
                >
                  {myRecord?.status === "LATE" ? `⚠️ LATE (+${myRecord.lateMinutes}m)` : "✅ ON TIME"}
                </span>
                <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-muted, #64748B)", marginTop: "2px" }}>
                  In at {myRecord?.checkIn}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-danger"
                disabled={loading}
                onClick={handlePunchOut}
                style={{
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  border: "none",
                  padding: "10px 22px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
                }}
              >
                <LogOut size={15} />
                <span>{loading ? "Recording…" : "PUNCH OUT"}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F1F5F9", padding: "8px 16px", borderRadius: "10px" }}>
              <BadgeCheck size={20} style={{ color: "#10B981" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "#0F172A", display: "block" }}>Shift Completed Today</strong>
                <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                  {myRecord?.checkIn} ➔ {myRecord?.checkOut} {myRecord?.totalHoursWorked ? `(${myRecord.totalHoursWorked})` : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Feedback Notice */}
      {punchMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(37, 99, 235, 0.08)",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "12.5px",
            color: "#2563EB",
            fontWeight: 600,
          }}
        >
          {punchMessage}
        </motion.div>
      )}
    </div>
  );
}

export default StaffPunchCard;
