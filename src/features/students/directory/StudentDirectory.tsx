import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Kanban,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  PlaneTakeoff,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { StudentService } from "../../../services/studentService";
import { AECS_AUTHORIZED_COUNTRIES } from "../../../lib/destinationsData";
import { CountryFlag } from "../../../components/ui/PhoneInput";

export interface StudentRecord {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  status: "NEW_LEAD" | "COUNSELLING" | "APPLICATION_SUBMITTED" | "OFFER_RECEIVED" | "VISA_PROCESSING" | "ENROLLED";
  targetCountry: string;
  targetCourse: string;
  targetIntake: string;
  budget: string;
  counsellor: string;
  englishTest: { test: string; score: string };
  academicSummary: string;
  documentsVerified: number;
  documentsTotal: number;
  notes: string[];
  createdAt: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  UK: "🇬🇧",
  Australia: "🇦🇺",
  Canada: "🇨🇦",
  USA: "🇺🇸",
  Germany: "🇩🇪",
  Japan: "🇯🇵",
  Finland: "🇫🇮",
};

const STAGE_CONFIG: Record<StudentRecord["status"], { label: string; tone: string; colName: string }> = {
  NEW_LEAD: { label: "New Inquiry", tone: "new-lead", colName: "1. New Inquiries" },
  COUNSELLING: { label: "In Counselling", tone: "counselling", colName: "2. In Counselling" },
  APPLICATION_SUBMITTED: { label: "App Submitted", tone: "application", colName: "3. App Submitted" },
  OFFER_RECEIVED: { label: "Offer Received", tone: "offer", colName: "4. Offer Received" },
  VISA_PROCESSING: { label: "Visa Processing", tone: "visa", colName: "5. Visa Lodged" },
  ENROLLED: { label: "Enrolled & Visited", tone: "enrolled", colName: "6. Enrolled" },
};

const KANBAN_STAGES: StudentRecord["status"][] = [
  "NEW_LEAD",
  "COUNSELLING",
  "APPLICATION_SUBMITTED",
  "OFFER_RECEIVED",
  "VISA_PROCESSING",
  "ENROLLED",
];

const INITIAL_STUDENTS: StudentRecord[] = [];

export function StudentDirectory() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);
  const [loadError, setLoadError] = useState("");

  // Inspector Drawer Active Tab
  const [inspectorTab, setInspectorTab] = useState<"profile" | "academic" | "docs" | "notes">("profile");
  const [newInspectorNote, setNewInspectorNote] = useState("");

  // Quick Lead Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: "",
    email: "",
    phone: "+977 98",
    dob: "2003-01-01",
    gender: "Female" as "Male" | "Female" | "Other",
    targetCountry: "UK",
    targetCourse: "",
    counsellor: "Unassigned",
  });

  useEffect(() => {
    StudentService.getStudents().then(data => {
      if (data && data.length > 0) {
        setStudents(data as StudentRecord[]);
      }
    }).catch(error => setLoadError(error instanceof Error ? error.message : "Students could not be loaded"));
  }, []);

  const filteredStudents = students.filter(std => {
    const matchesCountry = countryFilter === "ALL" || std.targetCountry === countryFilter;
    const matchesStatus = statusFilter === "ALL" || std.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = [std.fullName, std.code, std.email, std.phone, std.targetCourse]
      .some(value => String(value ?? "").toLowerCase().includes(query));
    return matchesCountry && matchesStatus && matchesSearch;
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await StudentService.createStudent({
      fullName: newLeadForm.fullName,
      email: newLeadForm.email,
      phone: newLeadForm.phone,
      dob: newLeadForm.dob,
      gender: newLeadForm.gender,
      targetCountry: newLeadForm.targetCountry,
      targetCourse: newLeadForm.targetCourse || "Bachelor / Master Degree",
      counsellor: newLeadForm.counsellor,
    });

    const updated = await StudentService.getStudents();
    setStudents(updated as StudentRecord[]);
    setShowAddModal(false);
    setNewLeadForm({
      fullName: "",
      email: "",
      phone: "+977 98",
      dob: "2003-01-01",
      gender: "Female",
      targetCountry: "UK",
      targetCourse: "",
      counsellor: "Unassigned",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to archive this student record?")) return;
    const updated = await StudentService.deleteStudent(id);
    setStudents(updated as StudentRecord[]);
    if (activeStudent?.id === id) setActiveStudent(null);
  };

  const handleAdvanceStage = async (std: StudentRecord) => {
    const currentIndex = KANBAN_STAGES.indexOf(std.status);
    if (currentIndex < KANBAN_STAGES.length - 1) {
      const nextStage = KANBAN_STAGES[currentIndex + 1];
      const updated = await StudentService.updateStatus(std.id, nextStage);
      setStudents(updated as StudentRecord[]);
      if (activeStudent?.id === std.id) {
        setActiveStudent({ ...activeStudent, status: nextStage });
      }
    }
  };

  const handleAddNoteToActiveStudent = () => {
    if (!newInspectorNote.trim() || !activeStudent) return;
    const updatedNotes = [newInspectorNote.trim(), ...activeStudent.notes];
    const updatedStudent = { ...activeStudent, notes: updatedNotes };
    setActiveStudent(updatedStudent);

    const updatedList = students.map(s => (s.id === activeStudent.id ? updatedStudent : s));
    setStudents(updatedList);
    localStorage.setItem("aecs_persistent_students", JSON.stringify(updatedList));
    setNewInspectorNote("");
  };

  const exportCSV = () => {
    const headers = ["Student Code,Full Name,Email,Phone,Country,Course,Status,Counsellor\n"];
    const rows = students.map(
      s => `"${s.code}","${s.fullName}","${s.email}","${s.phone}","${s.targetCountry}","${s.targetCourse}","${s.status}","${s.counsellor}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AECS_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      {loadError && <div className="alert-banner error" role="alert"><AlertCircle size={16}/>{loadError}</div>}
      {/* Header Row */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow">AECS Registered Candidates & Admissions Directory</span>
          <h2>Students & Admissions Pipeline</h2>
          <p>
            Official registered candidate dossiers with verified academic records, 10-point document compliance, and university admissions.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={exportCSV}
            title="Export Student Directory to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/students/register")}
          >
            <UserPlus size={16} />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* Flagship Metric Strip */}
      <div className="metrics-grid-4">
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Registered Students</span>
            <div className="metric-icon-wrap blue">
              <Users size={17} />
            </div>
          </div>
          <div className="metric-value">{students.length} Candidates</div>
          <span className="metric-sub">Active in Kathmandu Hub</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">In Counselling & Review</span>
            <div className="metric-icon-wrap amber">
              <BookOpen size={17} />
            </div>
          </div>
          <div className="metric-value">
            {students.filter(s => s.status === "COUNSELLING" || s.status === "NEW_LEAD").length}
          </div>
          <span className="metric-sub">Profile scrutiny & course choice</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Applications & Offers</span>
            <div className="metric-icon-wrap purple">
              <FileText size={17} />
            </div>
          </div>
          <div className="metric-value">
            {students.filter(s => s.status === "APPLICATION_SUBMITTED" || s.status === "OFFER_RECEIVED").length}
          </div>
          <span className="metric-sub">Offers & CAS / I-20 tracking</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Visa Processing & Enrolled</span>
            <div className="metric-icon-wrap green">
              <UserCheck size={17} />
            </div>
          </div>
          <div className="metric-value">
            {students.filter(s => s.status === "VISA_PROCESSING" || s.status === "ENROLLED").length}
          </div>
          <span className="metric-sub">Embassy visa clearances</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="crm-panel">
        {/* Filter Toolbar */}
        <div className="filter-toolbar">
          <div className="search-input-wrap" style={{ width: "340px" }}>
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidate name, AECS code, phone, course…"
            />
          </div>

          <div className="toolbar-selects">
            <select
              className="crm-select"
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
            >
              <option value="ALL">All Authorized Destinations ({AECS_AUTHORIZED_COUNTRIES.length})</option>
              {AECS_AUTHORIZED_COUNTRIES.map(c => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="crm-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Stages</option>
              <option value="NEW_LEAD">1. New Inquiry</option>
              <option value="COUNSELLING">2. In Counselling</option>
              <option value="APPLICATION_SUBMITTED">3. App Submitted</option>
              <option value="OFFER_RECEIVED">4. Offer Received</option>
              <option value="VISA_PROCESSING">5. Visa Lodged</option>
              <option value="ENROLLED">6. Enrolled</option>
            </select>

            {/* View Switcher */}
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <TableIcon size={14} />
                <span>Table</span>
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
                onClick={() => setViewMode("kanban")}
              >
                <Kanban size={14} />
                <span>Pipeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Stage Badges Strip */}
        <div
          style={{
            padding: "8px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-card-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          <button
            type="button"
            className={`coa-category-pill ${statusFilter === "ALL" ? "active" : ""}`}
            style={{ padding: "4px 10px", fontSize: "11px" }}
            onClick={() => setStatusFilter("ALL")}
          >
            All Candidates ({students.length})
          </button>
          {KANBAN_STAGES.map(stage => {
            const count = students.filter(s => s.status === stage).length;
            return (
              <button
                key={stage}
                type="button"
                className={`coa-category-pill ${statusFilter === stage ? "active" : ""}`}
                style={{ padding: "4px 10px", fontSize: "11px" }}
                onClick={() => setStatusFilter(statusFilter === stage ? "ALL" : stage)}
              >
                <span>{STAGE_CONFIG[stage].label}</span>
                <span className="code-font" style={{ opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* VIEW 1: HIGH-DENSITY PROFESSIONAL DATA TABLE */}
        {viewMode === "table" && (
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: "135px" }}>Student Code</th>
                  <th>Candidate Name & Contact</th>
                  <th>Destination & Course</th>
                  <th>English & Academics</th>
                  <th>Lifecycle Stage</th>
                  <th>Doc Scrutiny</th>
                  <th>Assigned Counsellor</th>
                  <th style={{ textAlign: "right", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(std => {
                  const initials = std.fullName
                    .split(" ")
                    .map(n => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const flag = COUNTRY_FLAGS[std.targetCountry] || "🌐";

                  return (
                    <tr
                      key={std.id}
                      onClick={() => setActiveStudent(std)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <span className="account-code-cell" style={{ background: "var(--bg-card-subtle)", padding: "3px 7px", borderRadius: "4px" }}>
                          {std.code}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "var(--primary-navy)",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div className="student-name-cell">
                            <strong style={{ fontSize: "13px" }}>{std.fullName}</strong>
                            <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                              {std.phone} · {std.email}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "15px" }}>{flag}</span>
                          <div>
                            <strong>{std.targetCountry}</strong>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                              {std.targetCourse}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: "12px", display: "block" }}>
                            {std.englishTest.test}
                          </span>
                          <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
                            {std.englishTest.score}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span className={`badge-status ${STAGE_CONFIG[std.status].tone}`}>
                          {STAGE_CONFIG[std.status].label}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "5px",
                              borderRadius: "99px",
                              background: "var(--bg-card-subtle)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(std.documentsVerified / std.documentsTotal) * 100}%`,
                                height: "100%",
                                background: std.documentsVerified === 10 ? "var(--success)" : "var(--accent-blue)",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700 }}>
                            {std.documentsVerified}/{std.documentsTotal}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <UserCheck size={14} style={{ color: "var(--accent-blue)" }} />
                          <span style={{ fontSize: "12px", color: "var(--text-main)", fontWeight: 500 }}>
                            {std.counsellor}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className="table-actions" style={{ justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/${std.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="table-btn"
                            title="Chat on WhatsApp"
                            style={{ color: "#10B981" }}
                          >
                            <MessageCircle size={14} />
                          </a>
                          <button
                            type="button"
                            className="table-btn"
                            title="View Full Profile Inspector"
                            onClick={() => setActiveStudent(std)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="table-btn"
                            title="Archive Record"
                            onClick={() => handleDelete(std.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: HIGH-FIDELITY KANBAN PIPELINE BOARD */}
        {viewMode === "kanban" && (
          <div className="pipeline-board">
            {KANBAN_STAGES.map(stage => {
              const stageStudents = filteredStudents.filter(s => s.status === stage);
              return (
                <div key={stage} className="pipeline-column">
                  <div className="pipeline-col-header">
                    <strong>{STAGE_CONFIG[stage].colName}</strong>
                    <span className="col-count">{stageStudents.length}</span>
                  </div>

                  <div className="pipeline-cards-list">
                    {stageStudents.map(std => {
                      const flag = COUNTRY_FLAGS[std.targetCountry] || "🌐";
                      return (
                        <div
                          key={std.id}
                          className="pipeline-card"
                          onClick={() => setActiveStudent(std)}
                        >
                          <div className="pcard-header">
                            <span className="pcard-code">{std.code}</span>
                            <span className="pcard-country">
                              {flag} {std.targetCountry}
                            </span>
                          </div>

                          <div className="pcard-name">{std.fullName}</div>
                          <div className="pcard-course">{std.targetCourse}</div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              margin: "6px 0",
                              fontSize: "10.5px",
                              color: "var(--text-muted)",
                            }}
                          >
                            <span>{std.englishTest.test}</span>
                            <strong style={{ color: "var(--accent-blue)" }}>{std.documentsVerified}/10 Docs</strong>
                          </div>

                          <div className="pcard-footer">
                            <span>{std.counsellor}</span>
                            {stage !== "ENROLLED" && (
                              <button
                                type="button"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--accent-blue)",
                                  fontSize: "10.5px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleAdvanceStage(std);
                                }}
                              >
                                <span>Advance</span>
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {stageStudents.length === 0 && (
                      <div style={{ textAlign: "center", padding: "28px 10px", color: "var(--text-muted)", fontSize: "11.5px" }}>
                        No candidate in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MULTI-TAB SLIDE-OVER STUDENT INSPECTOR DRAWER */}
      {activeStudent && (
        <div className="drawer-overlay" onClick={() => setActiveStudent(null)}>
          <div className="slide-over-panel" style={{ width: "min(620px, 100%)" }} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-header-info">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="account-code-cell" style={{ fontSize: "13px" }}>{activeStudent.code}</span>
                  <span className={`badge-status ${STAGE_CONFIG[activeStudent.status].tone}`}>
                    {STAGE_CONFIG[activeStudent.status].label}
                  </span>
                </div>
                <strong>{activeStudent.fullName}</strong>
                <span>Registered {activeStudent.createdAt} · Assigned to {activeStudent.counsellor}</span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setActiveStudent(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-card-subtle)",
                padding: "0 18px",
              }}
            >
              {[
                { key: "profile", label: "Profile & Identity", icon: Users },
                { key: "academic", label: "Academics & Tests", icon: GraduationCap },
                { key: "docs", label: "Doc Scrutiny", icon: FileCheck2 },
                { key: "notes", label: "Counselling Notes", icon: MessageSquare },
              ].map(tab => {
                const Icon = tab.icon;
                const active = inspectorTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "11px 14px",
                      fontSize: "12px",
                      fontWeight: active ? 700 : 500,
                      color: active ? "var(--accent-blue)" : "var(--text-muted)",
                      borderBottom: active ? "2px solid var(--accent-blue)" : "2px solid transparent",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => setInspectorTab(tab.key as any)}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inspector Body */}
            <div className="drawer-content">
              {inspectorTab === "profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <h4 className="drawer-section-title">
                      <Users size={15} />
                      <span>Contact & Identification</span>
                    </h4>
                    <div className="drawer-data-grid">
                      <div className="data-item">
                        <label>Email Address</label>
                        <span>{activeStudent.email}</span>
                      </div>
                      <div className="data-item">
                        <label>WhatsApp Phone</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{activeStudent.phone}</span>
                          <a
                            href={`https://wa.me/${activeStudent.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#10B981" }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                      </div>
                      <div className="data-item">
                        <label>Date of Birth</label>
                        <span>{activeStudent.dob}</span>
                      </div>
                      <div className="data-item">
                        <label>Gender</label>
                        <span>{activeStudent.gender}</span>
                      </div>
                      <div className="data-item" style={{ gridColumn: "1 / -1" }}>
                        <label>Current Address</label>
                        <span>{activeStudent.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="drawer-section-title">
                      <PlaneTakeoff size={15} />
                      <span>Study Abroad Target</span>
                    </h4>
                    <div className="drawer-data-grid">
                      <div className="data-item">
                        <label>Primary Destination</label>
                        <span>{COUNTRY_FLAGS[activeStudent.targetCountry]} {activeStudent.targetCountry}</span>
                      </div>
                      <div className="data-item">
                        <label>Intake Target</label>
                        <span>{activeStudent.targetIntake}</span>
                      </div>
                      <div className="data-item" style={{ gridColumn: "1 / -1" }}>
                        <label>Degree Course</label>
                        <span>{activeStudent.targetCourse}</span>
                      </div>
                      <div className="data-item">
                        <label>Estimated Annual Budget</label>
                        <span>{activeStudent.budget}</span>
                      </div>
                      <div className="data-item">
                        <label>Assigned Officer</label>
                        <span>{activeStudent.counsellor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === "academic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <h4 className="drawer-section-title">
                      <GraduationCap size={15} />
                      <span>Academic Background</span>
                    </h4>
                    <p style={{ padding: "12px 16px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", fontSize: "12.5px" }}>
                      {activeStudent.academicSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="drawer-section-title">
                      <Award size={15} />
                      <span>English Language Proficiency</span>
                    </h4>
                    <div style={{ padding: "14px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)" }}>
                      <strong style={{ fontSize: "14px", color: "var(--accent-blue)", display: "block", marginBottom: "4px" }}>
                        {activeStudent.englishTest.test}
                      </strong>
                      <span style={{ fontSize: "12.5px", color: "var(--text-main)" }}>
                        {activeStudent.englishTest.score}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === "docs" && (
                <div>
                  <h4 className="drawer-section-title">
                    <FileCheck2 size={15} />
                    <span>Visa Document Scrutiny ({activeStudent.documentsVerified}/{activeStudent.documentsTotal})</span>
                  </h4>
                  <div className="drawer-checklist">
                    <div className="drawer-check-item">
                      <span>Valid MRP / E-Passport (6+ Months)</span>
                      <span className="badge-status enrolled">Verified</span>
                    </div>
                    <div className="drawer-check-item">
                      <span>High School / Bachelor Transcripts</span>
                      <span className="badge-status enrolled">Verified</span>
                    </div>
                    <div className="drawer-check-item">
                      <span>English Proficiency TRF / Score Card</span>
                      <span className="badge-status enrolled">Verified</span>
                    </div>
                    <div className="drawer-check-item">
                      <span>Statement of Purpose (SOP)</span>
                      <span className="badge-status counselling">Under Review</span>
                    </div>
                    <div className="drawer-check-item">
                      <span>Bank Balance Certificate & Loan Sanction</span>
                      <span className="badge-status new-lead">Awaiting</span>
                    </div>
                    <div className="drawer-check-item">
                      <span>Relationship Verification Certificate</span>
                      <span className="badge-status new-lead">Awaiting</span>
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === "notes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h4 className="drawer-section-title">
                      <MessageSquare size={15} />
                      <span>Add Consultation Remark</span>
                    </h4>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={newInspectorNote}
                        onChange={e => setNewInspectorNote(e.target.value)}
                        placeholder="Log counselling note, phone call, or university update…"
                        style={{
                          flex: 1,
                          height: "38px",
                          padding: "0 12px",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-input)",
                          fontSize: "12.5px",
                        }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleAddNoteToActiveStudent}
                      >
                        <span>Add Note</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="drawer-section-title">
                      <Clock size={15} />
                      <span>Interaction Audit Trail</span>
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {activeStudent.notes.map((n, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 14px",
                            background: "var(--bg-card-subtle)",
                            borderLeft: "3px solid var(--accent-blue)",
                            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                            fontSize: "12px",
                            lineHeight: "1.45",
                          }}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD LEAD MODAL */}
      {showAddModal && (
        <div className="modal-backdrop-clean" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog-clean" onClick={e => e.stopPropagation()}>
            <div className="modal-header-clean">
              <div>
                <h3>Register Quick Student Lead</h3>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                  Create an intake case in the AECS Bagbazar operations database
                </p>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLead}>
              <div className="modal-body-clean">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.fullName}
                      onChange={e => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                      placeholder="e.g. Riya Sharma"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={newLeadForm.gender}
                      onChange={e => setNewLeadForm({ ...newLeadForm, gender: e.target.value as any })}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newLeadForm.email}
                      onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      placeholder="student@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newLeadForm.phone}
                      onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Target Destination *</label>
                    <select
                      value={newLeadForm.targetCountry}
                      onChange={e => setNewLeadForm({ ...newLeadForm, targetCountry: e.target.value })}
                    >
                      <option value="UK">🇬🇧 United Kingdom</option>
                      <option value="Australia">🇦🇺 Australia</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="USA">🇺🇸 United States</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="Japan">🇯🇵 Japan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned Lead Counsellor</label>
                    <select
                      value={newLeadForm.counsellor}
                      onChange={e => setNewLeadForm({ ...newLeadForm, counsellor: e.target.value })}
                    >
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Target Degree / Course</label>
                  <input
                    type="text"
                    value={newLeadForm.targetCourse}
                    onChange={e => setNewLeadForm({ ...newLeadForm, targetCourse: e.target.value })}
                    placeholder="e.g. MSc International Business"
                  />
                </div>
              </div>

              <div className="modal-footer-clean">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <UserPlus size={15} />
                  <span>Create Lead Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDirectory;
