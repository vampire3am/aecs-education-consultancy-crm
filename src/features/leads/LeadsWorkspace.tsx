import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadRecord, LeadService } from "../../services/studentService";
import { PhoneInput } from "../../components/ui/PhoneInput";
import { CountrySelect } from "../../components/ui/CountrySelect";
import { IntakePicker } from "../../components/ui/IntakePicker";
import { AECS_AUTHORIZED_COUNTRIES } from "../../lib/destinationsData";

const LEAD_STAGES = [
  { key: "NEW_INQUIRY", label: "New Inquiries", color: "blue" },
  { key: "CONTACTED", label: "Contacted / In Discussion", color: "purple" },
  { key: "COUNSELLING_SCHEDULED", label: "Counselling Booked", color: "amber" },
  { key: "HOT_PROSPECT", label: "Hot Prospects", color: "red" },
  { key: "CONVERTED", label: "Converted to Student", color: "green" },
];

export function LeadsWorkspace() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Modals & Drawer
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [activeLead, setActiveLead] = useState<LeadRecord | null>(null);
  const [newNote, setNewNote] = useState("");
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  // Capture Lead Form
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    source: "Facebook / Instagram Ads" as LeadRecord["source"],
    targetCountry: "UK" as LeadRecord["targetCountry"],
    targetCourse: "",
    targetIntake: "September 2026",
    budgetEstimate: "£15,000 / year",
    assignedCounsellor: "Sita Adhikari",
    stage: "NEW_INQUIRY" as LeadRecord["stage"],
    priority: "HIGH" as LeadRecord["priority"],
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const list = await LeadService.getLeads();
    setLeads(list);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) return;

    await LeadService.createLead({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      source: form.source,
      targetCountry: form.targetCountry,
      targetCourse: form.targetCourse || "Higher Education Degree",
      targetIntake: form.targetIntake,
      budgetEstimate: form.budgetEstimate,
      assignedCounsellor: form.assignedCounsellor,
      stage: form.stage,
      priority: form.priority,
    });

    await loadLeads();
    setShowCaptureModal(false);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      source: "Facebook / Instagram Ads",
      targetCountry: "UK",
      targetCourse: "",
      targetIntake: "September 2026",
      budgetEstimate: "£15,000 / year",
      assignedCounsellor: "Sita Adhikari",
      stage: "NEW_INQUIRY",
      priority: "HIGH",
    });
  };

  const handleConvertToStudent = async (lead: LeadRecord) => {
    const student = await LeadService.convertLeadToStudent(lead);
    await loadLeads();
    setConversionSuccess(student.code);
    setActiveLead(null);
  };

  const handleAddNote = (leadId: string) => {
    if (!newNote.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const noteText = `[${time}] ${newNote.trim()}`;
    const updated = leads.map(l => (l.id === leadId ? { ...l, notes: [noteText, ...l.notes] } : l));
    setLeads(updated);
    if (activeLead && activeLead.id === leadId) {
      setActiveLead({ ...activeLead, notes: [noteText, ...activeLead.notes] });
    }
    setNewNote("");
  };

  const exportCSV = () => {
    const headers = ["Lead Code,Full Name,Phone,Email,Source,Target Country,Target Course,Intake,Budget,Counsellor,Stage,Priority\n"];
    const rows = leads.map(
      l =>
        `"${l.leadCode}","${l.fullName}","${l.phone}","${l.email}","${l.source}","${l.targetCountry}","${l.targetCourse}","${l.targetIntake}","${l.budgetEstimate}","${l.assignedCounsellor}","${l.stage}","${l.priority}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AECS_Leads_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.leadCode.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.targetCourse.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === "ALL" || l.source.includes(sourceFilter);
    const matchesCountry = countryFilter === "ALL" || l.targetCountry === countryFilter;
    const matchesPriority = priorityFilter === "ALL" || l.priority === priorityFilter;

    return matchesSearch && matchesSource && matchesCountry && matchesPriority;
  });

  const totalInquiries = leads.length;
  const hotProspects = leads.filter(l => l.stage === "HOT_PROSPECT" || l.priority === "HIGH").length;
  const convertedCount = leads.filter(l => l.stage === "CONVERTED").length;
  const conversionPct = totalInquiries > 0 ? Math.round((convertedCount / totalInquiries) * 100) : 0;

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow">AECS Prospect Acquisition & Intake Pipeline</span>
          <h2>Leads & Inquiries Management</h2>
          <p>
            Prospect capture across Facebook/Instagram, walk-ins, and education fairs with 1-click conversion to enrolled students.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={exportCSV}
            title="Export Leads to CSV"
          >
            <Download size={15} />
            <span>Export Leads CSV</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowCaptureModal(true)}
          >
            <Zap size={16} />
            <span>+ Capture New Lead</span>
          </button>
        </div>
      </div>

      {/* Conversion Banner Alert */}
      {conversionSuccess && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 18px",
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={18} style={{ color: "var(--success)" }} />
            <div>
              <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>
                Lead Converted to Enrolled Student!
              </strong>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>
                Official AECS Student ID: <strong className="account-code-cell">{conversionSuccess}</strong>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: "4px 12px", fontSize: "11.5px" }}
              onClick={() => navigate("/students")}
            >
              View in Students Directory →
            </button>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setConversionSuccess(null)}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Flagship KPI Metric Strip */}
      <div className="metrics-grid-4">
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Total Inquiries</span>
            <div className="metric-icon-wrap blue">
              <Zap size={17} />
            </div>
          </div>
          <div className="metric-value">{totalInquiries} Leads</div>
          <span className="metric-sub">Active raw prospect pipeline</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Hot Prospects</span>
            <div className="metric-icon-wrap amber">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="metric-value">{hotProspects} High-Intent</div>
          <span className="metric-sub">Ready for enrollment & offer</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Converted Students</span>
            <div className="metric-icon-wrap green">
              <UserCheck size={17} />
            </div>
          </div>
          <div className="metric-value">{convertedCount} Enrolled</div>
          <span className="metric-sub">Official AECS IDs assigned</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Intake Conversion Rate</span>
            <div className="metric-icon-wrap purple">
              <Award size={17} />
            </div>
          </div>
          <div className="metric-value">{conversionPct}%</div>
          <span className="metric-sub">Inquiry-to-Admission ratio</span>
        </div>
      </div>

      {/* Toolbar & Filter Controls */}
      <div className="crm-panel">
        <div className="filter-toolbar">
          <div className="search-input-wrap" style={{ width: "320px" }}>
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lead code, name, phone, course…"
            />
          </div>

          <div className="toolbar-selects">
            <select
              className="crm-select"
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
            >
              <option value="ALL">All Marketing Sources</option>
              <option value="Facebook">Facebook & Instagram</option>
              <option value="Walk-in">Walk-in Inquiry</option>
              <option value="Google">Google Search</option>
              <option value="Education Fair">Education Fair 2026</option>
              <option value="Referral">Student Referral</option>
            </select>

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
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* View Switcher Toggle */}
            <div style={{ display: "flex", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "table" ? "var(--accent-blue)" : "var(--bg-card-subtle)",
                  color: viewMode === "table" ? "#FFFFFF" : "var(--text-muted)",
                }}
                onClick={() => setViewMode("table")}
              >
                Table
              </button>
              <button
                type="button"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "kanban" ? "var(--accent-blue)" : "var(--bg-card-subtle)",
                  color: viewMode === "kanban" ? "#FFFFFF" : "var(--text-muted)",
                }}
                onClick={() => setViewMode("kanban")}
              >
                Kanban
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: DATA TABLE */}
        {viewMode === "table" && (
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: "135px" }}>Lead Code</th>
                  <th>Candidate Name</th>
                  <th>Direct Contact</th>
                  <th>Source Attribution</th>
                  <th>Destination & Course</th>
                  <th>Assigned Counsellor</th>
                  <th>Priority</th>
                  <th>Pipeline Stage</th>
                  <th style={{ textAlign: "right", width: "170px" }}>Convert / Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const initials = lead.fullName
                    .split(" ")
                    .map(n => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setActiveLead(lead)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <span className="account-code-cell">{lead.leadCode}</span>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              background: lead.priority === "HIGH" ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.2)",
                              color: lead.priority === "HIGH" ? "var(--danger)" : "var(--accent-blue)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div className="student-name-cell">
                            <strong style={{ fontSize: "13px" }}>{lead.fullName}</strong>
                            <small>{lead.createdAt}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>{lead.phone}</span>
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            title="Chat on WhatsApp"
                            style={{ color: "#25D366" }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                      </td>

                      <td>
                        <span className="badge-status application">{lead.source}</span>
                      </td>

                      <td>
                        <div>
                          <span className="badge-status enrolled" style={{ marginRight: "6px" }}>
                            {lead.targetCountry}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 500 }}>{lead.targetCourse}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-main)" }}>{lead.assignedCounsellor}</span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background:
                              lead.priority === "HIGH"
                                ? "var(--danger-soft)"
                                : lead.priority === "MEDIUM"
                                ? "var(--warning-soft)"
                                : "var(--bg-card-subtle)",
                            color:
                              lead.priority === "HIGH"
                                ? "var(--danger)"
                                : lead.priority === "MEDIUM"
                                ? "var(--warning)"
                                : "var(--text-muted)",
                          }}
                        >
                          {lead.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge-status ${
                            lead.stage === "CONVERTED"
                              ? "enrolled"
                              : lead.stage === "HOT_PROSPECT"
                              ? "visa"
                              : lead.stage === "COUNSELLING_SCHEDULED"
                              ? "counselling"
                              : "new-lead"
                          }`}
                        >
                          {lead.stage.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {lead.stage !== "CONVERTED" ? (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: "4px 10px", fontSize: "11px", gap: "4px" }}
                            onClick={e => {
                              e.stopPropagation();
                              handleConvertToStudent(lead);
                            }}
                            title="Convert to Enrolled Student Profile"
                          >
                            <Sparkles size={12} />
                            <span>Convert to Student</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--success-text)", fontWeight: 600 }}>
                            ✓ Enrolled Student
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: KANBAN PIPELINE BOARD */}
        {viewMode === "kanban" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", padding: "18px", overflowX: "auto" }}>
            {LEAD_STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
              return (
                <div
                  key={stage.key}
                  style={{
                    background: "var(--bg-card-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    border: "1px solid var(--border-subtle)",
                    minHeight: "420px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <strong style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-main)" }}>
                      {stage.label}
                    </strong>
                    <span className="nav-badge" style={{ background: "var(--accent-blue)" }}>
                      {stageLeads.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setActiveLead(lead)}
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          padding: "12px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <span className="account-code-cell" style={{ fontSize: "11px" }}>{lead.leadCode}</span>
                          <span
                            style={{
                              fontSize: "9.5px",
                              fontWeight: 700,
                              padding: "1px 5px",
                              borderRadius: "3px",
                              background: lead.priority === "HIGH" ? "var(--danger-soft)" : "var(--bg-card-subtle)",
                              color: lead.priority === "HIGH" ? "var(--danger)" : "var(--text-muted)",
                            }}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        <strong style={{ fontSize: "13px", display: "block", color: "var(--text-main)", marginBottom: "4px" }}>
                          {lead.fullName}
                        </strong>

                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                          <span>{lead.targetCountry} · {lead.targetCourse}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", fontSize: "11px" }}>
                          <span style={{ color: "var(--text-muted)" }}>{lead.source.split("/")[0]}</span>
                          {lead.stage !== "CONVERTED" ? (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: "2px 6px", fontSize: "10.5px" }}
                              onClick={e => {
                                e.stopPropagation();
                                handleConvertToStudent(lead);
                              }}
                            >
                              Convert
                            </button>
                          ) : (
                            <span style={{ color: "var(--success-text)", fontWeight: 700 }}>Enrolled</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CAPTURE NEW LEAD MODAL */}
      {showCaptureModal && (
        <div className="modal-backdrop-clean" onClick={() => setShowCaptureModal(false)}>
          <div className="modal-dialog-clean" onClick={e => e.stopPropagation()}>
            <div className="modal-header-clean">
              <div>
                <h3>Capture Prospective Student Inquiry</h3>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                  Fast intake entry from walk-in, social media campaigns, or fairs
                </p>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowCaptureModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="modal-body-clean">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Sushant Shrestha"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile / WhatsApp Number *</label>
                    <PhoneInput
                      required
                      value={form.phone}
                      onChange={val => setForm({ ...form, phone: val })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="candidate@gmail.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Marketing Source Attribution *</label>
                    <select
                      value={form.source}
                      onChange={e => setForm({ ...form, source: e.target.value as any })}
                    >
                      <option value="Facebook / Instagram Ads">Facebook / Instagram Ads</option>
                      <option value="Google Search">Google Search & SEO</option>
                      <option value="Walk-in Inquiry">Walk-in Inquiry (Putalisadak Counter)</option>
                      <option value="Education Fair 2026">Education Fair 2026</option>
                      <option value="Student Referral">Student / Alumni Referral</option>
                      <option value="TikTok / Social">TikTok / Social Media DM</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Target Study Destination *</label>
                    <CountrySelect
                      required
                      value={form.targetCountry}
                      onChange={country => setForm({ ...form, targetCountry: country as any })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Course / Degree *</label>
                    <input
                      type="text"
                      required
                      value={form.targetCourse}
                      onChange={e => setForm({ ...form, targetCourse: e.target.value })}
                      placeholder="e.g. Master of Data Science"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Target Intake *</label>
                    <IntakePicker
                      required
                      value={form.targetIntake}
                      onChange={intake => setForm({ ...form, targetIntake: intake })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority Level</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value as any })}
                    >
                      <option value="HIGH">HIGH (Immediate follow-up)</option>
                      <option value="MEDIUM">MEDIUM (Standard follow-up)</option>
                      <option value="LOW">LOW (General inquiry)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigned Lead Counsellor</label>
                  <select
                    value={form.assignedCounsellor}
                    onChange={e => setForm({ ...form, assignedCounsellor: e.target.value })}
                  >
                    <option value="Sita Adhikari">Sita Adhikari (Senior Counsellor)</option>
                    <option value="Binod Maharjan">Binod Maharjan (Visa Specialist)</option>
                    <option value="Pooja Gurung">Pooja Gurung (Pokhara Branch)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-clean">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCaptureModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Zap size={15} />
                  <span>Capture & Assign Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DOSSIER & NOTES SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {activeLead && (
          <div className="modal-backdrop-clean" onClick={() => setActiveLead(null)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="modal-dialog-clean"
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                width: "480px",
                maxWidth: "100%",
                borderRadius: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span className="account-code-cell">{activeLead.leadCode}</span>
                    <span className="badge-status application">{activeLead.source}</span>
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                    {activeLead.fullName}
                  </h3>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setActiveLead(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: "20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Big Action Conversion Button */}
                {activeLead.stage !== "CONVERTED" ? (
                  <div style={{ padding: "16px", background: "var(--accent-blue-soft)", borderRadius: "var(--radius-sm)", border: "1px solid var(--accent-blue)" }}>
                    <strong style={{ fontSize: "13px", display: "block", color: "var(--text-main)", marginBottom: "4px" }}>
                      Ready to enroll this prospect?
                    </strong>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "0 0 12px 0" }}>
                      Creates an official AECS Student dossier with unique ID, document checklist, and double-entry billing.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => handleConvertToStudent(activeLead)}
                    >
                      <Sparkles size={15} />
                      <span>✨ Convert to Registered Student Profile</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: "12px 16px", background: "var(--success-soft)", borderRadius: "var(--radius-sm)", border: "1px solid var(--success)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--success-text)" }}>
                      Converted to Registered Student
                    </span>
                  </div>
                )}

                {/* Lead Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Phone / WhatsApp</span>
                    <strong style={{ fontFamily: "var(--font-mono)" }}>{activeLead.phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Email</span>
                    <strong>{activeLead.email || "—"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Target Country</span>
                    <strong>{activeLead.targetCountry}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Intake</span>
                    <strong>{activeLead.targetIntake}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Target Course</span>
                    <strong>{activeLead.targetCourse}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Assigned Counsellor</span>
                    <strong>{activeLead.assignedCounsellor}</strong>
                  </div>
                </div>

                {/* Counsellor Notes Feed */}
                <div>
                  <strong style={{ fontSize: "13px", display: "block", marginBottom: "10px", color: "var(--text-main)" }}>
                    Counsellor Consultation Notes
                  </strong>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add follow-up note or consultation remark…"
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: "12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-card)",
                        color: "var(--text-main)",
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddNote(activeLead.id);
                      }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleAddNote(activeLead.id)}
                    >
                      <Send size={14} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {activeLead.notes.map((note, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "10px 12px",
                          background: "var(--bg-card-subtle)",
                          borderRadius: "6px",
                          fontSize: "12px",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-main)",
                        }}
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LeadsWorkspace;
