import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers,
  MapPin,
  MessageSquare,
  PlaneTakeoff,
  Plus,
  Receipt,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { StudentService } from "../../services/studentService";

// Trend series for 30-day analytics
const INTAKE_TREND_DATA = [
  { day: "01 Aug", leads: 4, applications: 2, classes: 3 },
  { day: "03 Aug", leads: 6, applications: 3, classes: 4 },
  { day: "05 Aug", leads: 5, applications: 4, classes: 2 },
  { day: "07 Aug", leads: 8, applications: 5, classes: 6 },
  { day: "09 Aug", leads: 7, applications: 4, classes: 5 },
  { day: "11 Aug", leads: 11, applications: 7, classes: 8 },
  { day: "13 Aug", leads: 9, applications: 6, classes: 7 },
  { day: "15 Aug", leads: 12, applications: 8, classes: 9 },
  { day: "Today", leads: 14, applications: 9, classes: 10 },
];

const DESTINATION_DATA = [
  { name: "United Kingdom", value: 42, color: "#2563EB" },
  { name: "Australia", value: 28, color: "#10B981" },
  { name: "Canada", value: 16, color: "#F59E0B" },
  { name: "United States", value: 10, color: "#8B5CF6" },
  { name: "Germany & Japan", value: 4, color: "#06B6D4" },
];

const TODAY_APPOINTMENTS: any[] = [];

const RECENT_ACTIVITIES: any[] = [];

export function ManagementDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    StudentService.getStudents().then(data => {
      setTotalStudents(data ? data.length : 0);
    });
  }, []);

  return (
    <div className="page-container">
      {/* Executive Welcome Header */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow">
            AECS Kathmandu Central · Executive Operations
          </span>
          <h2>Executive Operations Hub</h2>
          <p>
            Real-time admissions pipeline, daily counselling schedule, and revenue analytics for AECS Kathmandu.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/students/register")}
          >
            <UserPlus size={15} />
            <span>6-Step Registration</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/students")}
          >
            <Plus size={15} />
            <span>Quick Lead</span>
          </button>
        </div>
      </div>

      {/* Flagship KPI Strip */}
      <div className="metrics-grid-4" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Active Student Leads</span>
            <div className="metric-icon-wrap blue">
              <Users size={17} />
            </div>
          </div>
          <div className="metric-value">{totalStudents}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--success-text)", fontWeight: 600 }}>
            <ArrowUpRight size={13} />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">In Counselling</span>
            <div className="metric-icon-wrap amber">
              <BookOpen size={17} />
            </div>
          </div>
          <div className="metric-value">26</div>
          <span className="metric-sub">Active consultations & prep</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Offers Secured</span>
            <div className="metric-icon-wrap purple">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="metric-value">18</div>
          <span className="metric-sub">UK, Australia, Canada, USA</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Visa Grant Ratio</span>
            <div className="metric-icon-wrap green">
              <GraduationCap size={17} />
            </div>
          </div>
          <div className="metric-value">96.2%</div>
          <span className="metric-sub">FY 2026/27 Statutory</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Month Revenue (NPR)</span>
            <div className="metric-icon-wrap green">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="metric-value">₨ 8.42L</div>
          <span className="metric-sub">VAT & PAN Compliant</span>
        </div>
      </div>

      {/* Main Grid: Charts & Operations Agenda */}
      <div className="grid-2col" style={{ gridTemplateColumns: "1.45fr 1fr", marginBottom: "24px" }}>
        {/* Left: 30-Day Lead & Intake Trajectory */}
        <div className="crm-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header-bar">
            <div>
              <h3>30-Day Intake & Application Trajectory</h3>
              <p>Daily volume of prospective inquiries, university applications, and class intakes</p>
            </div>
            <span className="status-pill">Asia/Kathmandu (UTC+05:45)</span>
          </div>

          <div className="panel-body" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INTAKE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12px",
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11.5px", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="leads" name="New Inquiries" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="applications" name="Uni Applications" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Today's Counselling Agenda */}
        <div className="crm-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header-bar">
            <div>
              <h3>Today's Counselling Appointments</h3>
              <p>Scheduled consultations at Kathmandu Central Desk</p>
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/counselling")}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {TODAY_APPOINTMENTS.map(item => (
              <div
                key={item.id}
                style={{
                  padding: "11px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      padding: "6px 9px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--accent-blue)",
                    }}
                  >
                    {item.time}
                  </div>
                  <div>
                    <strong style={{ fontSize: "12.5px", color: "var(--text-main)", display: "block" }}>
                      {item.studentName}
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {item.target} · {item.counsellor}
                    </span>
                  </div>
                </div>

                <span
                  className={`badge-status ${item.status === "In Progress" ? "counselling" : item.status === "Confirmed" ? "enrolled" : "new-lead"}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Market Distribution & Recent Activity Stream */}
      <div className="grid-2col" style={{ gridTemplateColumns: "1fr 1.45fr" }}>
        {/* Left: Destination Market Distribution */}
        <div className="crm-panel">
          <div className="panel-header-bar">
            <div>
              <h3>Destination Preference</h3>
              <p>Top study abroad countries among active applicants</p>
            </div>
            <span className="status-pill">2026/27 Intake</span>
          </div>

          <div className="panel-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {DESTINATION_DATA.map(d => (
                <div key={d.name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <strong style={{ color: "var(--text-main)" }}>{d.name}</strong>
                    <span className="code-font" style={{ fontWeight: 700, color: "var(--text-muted)" }}>
                      {d.value}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      borderRadius: "99px",
                      background: "var(--bg-card-subtle)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${d.value}%`,
                        background: d.color,
                        borderRadius: "99px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Operational Activity Stream */}
        <div className="crm-panel">
          <div className="panel-header-bar">
            <div>
              <h3>Live Operations Stream</h3>
              <p>Auditable log of admissions, visa grants, and billing transactions</p>
            </div>
            <span className="status-pill">Live Feed</span>
          </div>

          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {RECENT_ACTIVITIES.map(act => (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background:
                      act.type === "visa"
                        ? "var(--success-soft)"
                        : act.type === "offer"
                        ? "var(--purple-soft)"
                        : act.type === "invoice"
                        ? "var(--accent-blue-soft)"
                        : "var(--warning-soft)",
                    color:
                      act.type === "visa"
                        ? "var(--success)"
                        : act.type === "offer"
                        ? "var(--purple)"
                        : act.type === "invoice"
                        ? "var(--accent-blue)"
                        : "var(--warning)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {act.type === "visa" ? (
                    <GraduationCap size={16} />
                  ) : act.type === "offer" ? (
                    <CheckCircle2 size={16} />
                  ) : act.type === "invoice" ? (
                    <Receipt size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>{act.title}</strong>
                    <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{act.time}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 3px" }}>{act.desc}</p>
                  <span style={{ fontSize: "10.5px", color: "var(--accent-blue)", fontWeight: 600 }}>By: {act.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fast Navigation Workspace Cards */}
      <div className="metrics-grid-4" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        <button
          type="button"
          className="metric-box"
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => navigate("/students")}
        >
          <div className="metric-icon-wrap blue">
            <Users size={17} />
          </div>
          <strong style={{ fontSize: "12.5px", marginTop: "4px" }}>Students & Leads</strong>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Directory & Kanban</span>
        </button>

        <button
          type="button"
          className="metric-box"
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => navigate("/counselling")}
        >
          <div className="metric-icon-wrap amber">
            <BookOpen size={17} />
          </div>
          <strong style={{ fontSize: "12.5px", marginTop: "4px" }}>Counselling Hub</strong>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Notes & Follow-ups</span>
        </button>

        <button
          type="button"
          className="metric-box"
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => navigate("/applications")}
        >
          <div className="metric-icon-wrap purple">
            <PlaneTakeoff size={17} />
          </div>
          <strong style={{ fontSize: "12.5px", marginTop: "4px" }}>Applications & Visas</strong>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Offers & CAS/I-20</span>
        </button>

        <button
          type="button"
          className="metric-box"
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => navigate("/documents")}
        >
          <div className="metric-icon-wrap blue">
            <FileCheck2 size={17} />
          </div>
          <strong style={{ fontSize: "12.5px", marginTop: "4px" }}>Document Desk</strong>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>10-Point Checklist</span>
        </button>

        <button
          type="button"
          className="metric-box"
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => navigate("/classes")}
        >
          <div className="metric-icon-wrap green">
            <GraduationCap size={17} />
          </div>
          <strong style={{ fontSize: "12.5px", marginTop: "4px" }}>Classes & Batches</strong>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>IELTS / PTE / German</span>
        </button>

        <button
          type="button"
          className="metric-box"
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => navigate("/finance")}
        >
          <div className="metric-icon-wrap amber">
            <CreditCard size={17} />
          </div>
          <strong style={{ fontSize: "12.5px", marginTop: "4px" }}>Finance & COA</strong>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>454 Master Ledgers</span>
        </button>
      </div>
    </div>
  );
}

export default ManagementDashboard;
