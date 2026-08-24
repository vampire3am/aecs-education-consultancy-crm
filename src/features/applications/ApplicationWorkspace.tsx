import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, CheckCircle2, ChevronRight, Eye, FileSpreadsheet, GraduationCap, Kanban, PlaneTakeoff, Plus, Search, Table as TableIcon, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ApplicationService,
  type UniversityApplication,
} from "../../services/applicationService";
import { useAuth } from "../auth/AuthProvider";
import { CaseTaskPanel } from "./CaseTaskPanel";
import { KpiTrendIndicator } from "../../components/common/KpiTrendIndicator";
import { CountryDisplay } from "../../components/ui/CountryDisplay";
import { StudentDirectoryRecord, StudentService } from "../../services/studentService";

type ApplicationDestination = { name: string; code: string; popularIntakes?: string[]; intakeCycles?: string[] };
type ApplicationUniversity = { name: string; country: string; countryCode: string; popularCourses?: string[]; tuition?: string; intake?: string };
const APPLICATION_DESTINATIONS_KEY = "aecs_destinations_catalog_v2";
const APPLICATION_UNIVERSITIES_KEY = "aecs_partner_universities_v2";

type ApplicationStage = UniversityApplication["stage"];

const STAGES: { key: ApplicationStage | "ALL"; label: string; tabLabel: string; tone: string }[] = [
  { key: "ALL", label: "All Applications", tabLabel: "All Applications", tone: "blue" },
  { key: "SUBMITTED", label: "Under Review", tabLabel: "Under Review", tone: "amber" },
  { key: "CONDITIONAL_OFFER", label: "Conditional Offer", tabLabel: "Conditional Offer", tone: "blue" },
  { key: "UNCONDITIONAL_OFFER", label: "Unconditional Offer", tabLabel: "Unconditional Offer", tone: "green" },
  { key: "CAS_ISSUED", label: "CAS / I-20 Issued", tabLabel: "CAS / I-20 Issued", tone: "purple" },
  { key: "VISA_LODGED", label: "Visa Lodged", tabLabel: "Visa Lodged", tone: "indigo" },
  { key: "VISA_APPROVED", label: "Visa Approved", tabLabel: "Visa Approved", tone: "green" },
];

export function ApplicationWorkspace() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");
  const [activeTab, setActiveTab] = useState<ApplicationStage | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [students, setStudents] = useState<StudentDirectoryRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [catalogDestinations, setCatalogDestinations] = useState<ApplicationDestination[]>([]);
  const [catalogUniversities, setCatalogUniversities] = useState<ApplicationUniversity[]>([]);

  // Modals & Drawers
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeDossier, setActiveDossier] = useState<UniversityApplication | null>(null);
  const [stageChangeApp, setStageChangeApp] = useState<UniversityApplication | null>(null);

  // Submit Application Form State
  const [newAppForm, setNewAppForm] = useState({
    studentCode: "",
    studentName: "",
    universityName: "",
    country: "UK" as UniversityApplication["country"],
    countryCode: "GB" as UniversityApplication["countryCode"],
    course: "",
    intake: "",
    stage: "SUBMITTED" as ApplicationStage,
    deadline: "",
    officer: profile?.full_name || "",
    tuitionFee: "",
    scholarship: "",
    notes: "",
  });

  const loadApplications = async () => {
    setLoading(true);
    const data = await ApplicationService.getApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    // Initial remote hydration is intentionally performed once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadApplications();
  }, []);

  useEffect(() => {
    void StudentService.getStudents().then(setStudents).catch(() => setStudents([]));
    try {
      setCatalogDestinations(JSON.parse(localStorage.getItem(APPLICATION_DESTINATIONS_KEY) || "[]"));
      setCatalogUniversities(JSON.parse(localStorage.getItem(APPLICATION_UNIVERSITIES_KEY) || "[]"));
    } catch {
      setCatalogDestinations([]);
      setCatalogUniversities([]);
    }
  }, [showSubmitModal]);

  useEffect(() => {
    const routeState = location.state as { openApplicationForm?: boolean; country?: string; countryCode?: string } | null;
    if (!routeState?.openApplicationForm) return;
    setNewAppForm(current => ({
      ...current,
      country: routeState.country || current.country,
      countryCode: routeState.countryCode || current.countryCode,
    }));
    setShowSubmitModal(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const universitiesForCountry = useMemo(() => catalogUniversities.filter(university =>
    university.country === newAppForm.country || university.countryCode === newAppForm.countryCode
  ), [catalogUniversities, newAppForm.country, newAppForm.countryCode]);

  const coursesForSelection = useMemo(() => {
    const selectedUniversity = universitiesForCountry.find(university => university.name === newAppForm.universityName);
    const source = selectedUniversity ? [selectedUniversity] : universitiesForCountry;
    return Array.from(new Set(source.flatMap(university => university.popularCourses || []).filter(Boolean))).sort();
  }, [newAppForm.universityName, universitiesForCountry]);

  const selectStudent = (value: string) => {
    setStudentSearch(value);
    const selected = students.find(student => `${student.fullName} · ${student.code}` === value || student.code === value);
    if (!selected) return;
    setNewAppForm(current => ({ ...current, studentName: selected.fullName, studentCode: selected.code }));
  };

  const selectDestination = (countryName: string) => {
    const destination = catalogDestinations.find(item => item.name === countryName);
    setNewAppForm(current => ({
      ...current,
      country: countryName,
      countryCode: destination?.code || "",
      universityName: "",
      course: "",
      intake: destination?.intakeCycles?.[0] || destination?.popularIntakes?.[0] || "",
    }));
  };

  const selectUniversity = (universityName: string) => {
    const university = universitiesForCountry.find(item => item.name === universityName);
    setNewAppForm(current => ({
      ...current,
      universityName,
      course: university?.popularCourses?.[0] || "",
      tuitionFee: university?.tuition || current.tuitionFee,
      intake: university?.intake || current.intake,
    }));
  };

  // Compute 4 Top Metrics (Matching User Screenshot)
  const totalActive = applications.length;
  const confirmedOffers = applications.filter(
    a => a.stage === "UNCONDITIONAL_OFFER" || a.stage === "CONDITIONAL_OFFER"
  ).length;
  const visaQueue = applications.filter(a => a.stage === "VISA_LODGED").length;
  const visasApproved = applications.filter(a => a.stage === "VISA_APPROVED").length;

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Tab filter
      if (activeTab !== "ALL" && app.stage !== activeTab) return false;

      // Dropdown stage filter
      if (stageFilter !== "ALL" && app.stage !== stageFilter) return false;

      // Destination filter
      if (destinationFilter !== "ALL" && app.country !== destinationFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          app.studentName.toLowerCase().includes(q) ||
          app.studentCode.toLowerCase().includes(q) ||
          app.universityName.toLowerCase().includes(q) ||
          app.course.toLowerCase().includes(q) ||
          app.country.toLowerCase().includes(q) ||
          app.officer.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [applications, activeTab, stageFilter, destinationFilter, searchQuery]);

  // Stage counters for tabs
  const getStageCount = (stageKey: ApplicationStage | "ALL") => {
    if (stageKey === "ALL") return applications.length;
    return applications.filter(a => a.stage === stageKey).length;
  };

  // Submit Handler
  const handleSubmitNewApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.studentName.trim() || !newAppForm.universityName.trim()) return;

    let cCode: UniversityApplication["countryCode"] = newAppForm.countryCode || "GB";
    if (newAppForm.country === "Australia") cCode = "AU";
    else if (newAppForm.country === "Canada") cCode = "CA";
    else if (newAppForm.country === "USA") cCode = "US";
    else if (newAppForm.country === "Germany") cCode = "DE";
    else if (newAppForm.country === "New Zealand") cCode = "NZ";
    else if (newAppForm.country === "Finland") cCode = "FI";
    else if (newAppForm.country === "Ireland") cCode = "IE";
    else if (newAppForm.country === "Japan") cCode = "JP";

    await ApplicationService.createApplication({
      studentCode: newAppForm.studentCode.trim(),
      studentName: newAppForm.studentName.trim(),
      universityName: newAppForm.universityName.trim(),
      country: newAppForm.country,
      countryCode: cCode,
      course: newAppForm.course.trim(),
      intake: newAppForm.intake,
      stage: newAppForm.stage,
      deadline: newAppForm.deadline,
      officer: newAppForm.officer,
      tuitionFee: newAppForm.tuitionFee.trim(),
      scholarship: newAppForm.scholarship.trim(),
      appliedDate: new Date().toISOString().split("T")[0],
      notes: newAppForm.notes.trim(),
    });

    await loadApplications();
    setShowSubmitModal(false);
    setNewAppForm({
      studentCode: "",
      studentName: "",
      universityName: "",
      country: "UK",
      countryCode: "GB",
      course: "",
      intake: "",
      stage: "SUBMITTED",
      deadline: "",
      officer: profile?.full_name || "",
      tuitionFee: "",
      scholarship: "",
      notes: "",
    });
  };

  // Quick Stage Update Handler
  const handleUpdateStage = async (newStage: ApplicationStage) => {
    if (!stageChangeApp) return;
    await ApplicationService.updateApplicationStage(stageChangeApp.id, newStage);
    await loadApplications();
    setStageChangeApp(null);
  };

  return (
    <div className="page-container">
      {loading && <div className="phase2-loading" role="status">Loading live applications…</div>}
      {/* 1. Header Row (Matching User Screenshot Layout) */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow" style={{ color: "#38BDF8", letterSpacing: "0.04em" }}>
            AECS UNIVERSITY ADMISSIONS & VISAS
          </span>
          <h2>University Applications & Lodgements</h2>
          <p>
            Track overseas university submissions, conditional offer letters, CAS/I-20 confirmations, and embassy visa outcomes.
          </p>
        </div>

        <div className="page-header-actions" style={{ display: "flex", gap: "10px" }}>
          {/* Export CSV Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => ApplicationService.exportCsv(applications)}
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          {/* Submit New Application action */}
          <button
            type="button"
            className="btn-primary"
            style={{ background: "#F97316", borderColor: "#F97316", color: "#FFFFFF" }}
            onClick={() => setShowSubmitModal(true)}
          >
            <Plus size={15} />
            <span>Submit New Application</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Boxes (Matching User Screenshot Layout) */}
      <div className="metrics-grid-4" style={{ marginBottom: "20px" }}>
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Applications Active</span>
            <div className="metric-icon-wrap blue">
              <BookOpen size={17} />
            </div>
          </div>
          <div className="metric-value">{totalActive}</div>
          <KpiTrendIndicator metricKey="applications.active" value={totalActive} label="Across UK, Aus, Canada, USA, Germany" />
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Confirmed Offers</span>
            <div className="metric-icon-wrap green">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="metric-value">{confirmedOffers}</div>
          <KpiTrendIndicator metricKey="applications.offers" value={confirmedOffers} label="Ready for fee deposit & CAS" />
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Embassy Visa Queue</span>
            <div className="metric-icon-wrap amber">
              <PlaneTakeoff size={17} />
            </div>
          </div>
          <div className="metric-value">{visaQueue}</div>
          <KpiTrendIndicator metricKey="applications.visa-queue" value={visaQueue} label="Biometrics & decision pending" />
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Total Visas Granted</span>
            <div className="metric-icon-wrap purple">
              <GraduationCap size={17} />
            </div>
          </div>
          <div className="metric-value">{visasApproved}</div>
          <KpiTrendIndicator metricKey="applications.visas-approved" value={visasApproved} label="Approved application records" />
        </div>
      </div>

      <CaseTaskPanel />

      {/* 3. Search & Toolbar Filter Row (Matching User Screenshot) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <div className="search-input-wrap" style={{ flex: 1, minWidth: "280px" }}>
          <Search size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search university, student code, course..."
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Destination dropdown */}
          <select
            className="crm-select"
            value={destinationFilter}
            onChange={e => setDestinationFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="ALL">All Destinations</option>
            <option value="UK">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
            <option value="USA">United States</option>
            <option value="Germany">Germany</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Finland">Finland</option>
            <option value="Ireland">Ireland</option>
            <option value="Japan">Japan</option>
          </select>

          {/* Stage dropdown */}
          <select
            className="crm-select"
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            style={{ width: "180px" }}
          >
            <option value="ALL">All Application Stages</option>
            <option value="SUBMITTED">Under Review</option>
            <option value="CONDITIONAL_OFFER">Conditional Offer</option>
            <option value="UNCONDITIONAL_OFFER">Unconditional Offer</option>
            <option value="CAS_ISSUED">CAS / I-20 Issued</option>
            <option value="VISA_LODGED">Visa Lodged</option>
            <option value="VISA_APPROVED">Visa Approved</option>
          </select>

          {/* View mode toggle (Table vs Pipeline) */}
          <div className="view-mode-toggle" style={{ display: "flex", background: "var(--bg-card-subtle)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <button
              type="button"
              className={viewMode === "table" ? "active" : ""}
              onClick={() => setViewMode("table")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "table" ? "var(--bg-card)" : "transparent",
                color: viewMode === "table" ? "var(--text-main)" : "var(--text-muted)",
                boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>

            <button
              type="button"
              className={viewMode === "pipeline" ? "active" : ""}
              onClick={() => setViewMode("pipeline")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "pipeline" ? "var(--bg-card)" : "transparent",
                color: viewMode === "pipeline" ? "var(--text-main)" : "var(--text-muted)",
                boxShadow: viewMode === "pipeline" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <Kanban size={14} />
              <span>Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs with Dynamic Counters (Matching User Screenshot) */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {STAGES.map(st => {
          const count = getStageCount(st.key);
          const isSelected = activeTab === st.key;

          return (
            <button
              key={st.key}
              type="button"
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                border: isSelected ? "1px solid #F97316" : "1px solid var(--border-subtle)",
                background: isSelected ? "#F97316" : "var(--bg-card)",
                color: isSelected ? "#FFFFFF" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
              onClick={() => setActiveTab(st.key)}
            >
              <span>{st.tabLabel}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  background: isSelected ? "rgba(255,255,255,0.25)" : "var(--bg-card-subtle)",
                  color: isSelected ? "#FFFFFF" : "var(--text-main)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          VIEW MODE 1: DATA TABLE (MATCHING USER SCREENSHOT COLUMNS & CARDS)
          ========================================================================= */}
      {viewMode === "table" ? (
        <div className="crm-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>STUDENT CANDIDATE</th>
                  <th>TARGET UNIVERSITY & DESTINATION</th>
                  <th>DEGREE / COURSE</th>
                  <th>INTAKE CYCLE</th>
                  <th>TUITION & SCHOLARSHIP</th>
                  <th>STATUS STAGE</th>
                  <th>APPLICATION OFFICER</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <PlaneTakeoff size={32} style={{ opacity: 0.35 }} />
                        <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>No applications found in this view</strong>
                        <span style={{ fontSize: "12px" }}>Submit a new university application dossier or clear filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map(app => {
                    const initials = app.studentName
                      .split(" ")
                      .map(n => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    // Status stage styling
                    let stageBadgeStyle = {
                      background: "rgba(249, 115, 22, 0.12)",
                      color: "#F97316",
                      border: "1px solid rgba(249, 115, 22, 0.25)",
                    };
                    let stageLabel = "Under Review";

                    if (app.stage === "CONDITIONAL_OFFER") {
                      stageBadgeStyle = { background: "rgba(251, 146, 60, 0.15)", color: "#FB923C", border: "1px solid rgba(251, 146, 60, 0.3)" };
                      stageLabel = "Conditional Offer";
                    } else if (app.stage === "UNCONDITIONAL_OFFER") {
                      stageBadgeStyle = { background: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)" };
                      stageLabel = "Unconditional Offer";
                    } else if (app.stage === "CAS_ISSUED") {
                      stageBadgeStyle = { background: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6", border: "1px solid rgba(139, 92, 246, 0.3)" };
                      stageLabel = "CAS / I-20 Issued";
                    } else if (app.stage === "VISA_LODGED") {
                      stageBadgeStyle = { background: "rgba(99, 102, 241, 0.15)", color: "#6366F1", border: "1px solid rgba(99, 102, 241, 0.3)" };
                      stageLabel = "Visa Lodged";
                    } else if (app.stage === "VISA_APPROVED") {
                      stageBadgeStyle = { background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", border: "1px solid rgba(34, 197, 94, 0.3)" };
                      stageLabel = "Visa Approved";
                    } else if (app.stage === "SUBMITTED") {
                      stageBadgeStyle = { background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" };
                      stageLabel = "Under Review";
                    }

                    return (
                      <tr
                        key={app.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveDossier(app)}
                      >
                        {/* 1. Student Candidate */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                background: "var(--primary-navy)",
                                color: "#FFFFFF",
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
                            <div>
                              <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>
                                {app.studentName}
                              </strong>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                {app.studentCode}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Target University & Destination */}
                        <td>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <CountryDisplay country={app.country} size={16}/>
                              <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>
                                {app.universityName}
                              </strong>
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                              Destination: <CountryDisplay country={app.country} size={14}/>
                            </div>
                          </div>
                        </td>

                        {/* 3. Degree / Course */}
                        <td>
                          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>
                            {app.course}
                          </span>
                        </td>

                        {/* 4. Intake Cycle */}
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--text-main)" }}>
                            {app.intake}
                          </span>
                        </td>

                        {/* 5. Tuition & Scholarship */}
                        <td>
                          <div>
                            <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>
                              {app.tuitionFee}
                            </strong>
                            <div style={{ fontSize: "11px", color: "#10B981", marginTop: "1px" }}>
                              {app.scholarship}
                            </div>
                          </div>
                        </td>

                        {/* 6. Status Stage */}
                        <td>
                          <span
                            style={{
                              ...stageBadgeStyle,
                              fontSize: "11.5px",
                              fontWeight: 600,
                              padding: "4px 10px",
                              borderRadius: "16px",
                              display: "inline-block",
                            }}
                          >
                            {stageLabel}
                          </span>
                        </td>

                        {/* 7. Application Officer */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-main)" }}>
                            <User size={13} style={{ color: "var(--text-muted)" }} />
                            <span>{app.officer}</span>
                          </div>
                        </td>

                        {/* 8. Actions */}
                        <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => setActiveDossier(app)}
                              title="View Application Dossier"
                            >
                              <Eye size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "4px 10px", fontSize: "11.5px" }}
                              onClick={() => setStageChangeApp(app)}
                              title="Update Admission Stage"
                            >
                              <span>Stage</span>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE 2: KANBAN PIPELINE BOARD
            ========================================================================= */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", alignItems: "flex-start" }}>
          {STAGES.filter(s => s.key !== "ALL").map(col => {
            const colApps = applications.filter(a => a.stage === col.key);

            return (
              <div
                key={col.key}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  minHeight: "450px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <strong style={{ fontSize: "13px" }}>{col.label}</strong>
                  <span className="nav-badge" style={{ background: "var(--bg-card-subtle)", color: "var(--text-main)" }}>
                    {colApps.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  {colApps.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 10px", color: "var(--text-muted)", fontSize: "11.5px" }}>
                      No dossiers in this stage
                    </div>
                  ) : (
                    colApps.map(app => (
                      <div
                        key={app.id}
                        style={{
                          background: "var(--bg-card-subtle)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "12px",
                          cursor: "pointer",
                        }}
                        onClick={() => setActiveDossier(app)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <strong style={{ fontSize: "13px" }}>{app.studentName}</strong>
                          <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                            {app.studentCode}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "4px" }}>
                          {app.universityName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                          {app.course} · {app.intake}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                          <span style={{ color: "#10B981", fontWeight: 600 }}>{app.tuitionFee}</span>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "2px 6px", fontSize: "10.5px" }}
                            onClick={e => {
                              e.stopPropagation();
                              setStageChangeApp(app);
                            }}
                          >
                            Advance →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: SUBMIT NEW UNIVERSITY APPLICATION
          ========================================================================= */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="modal-backdrop-clean" onClick={() => setShowSubmitModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-dialog-clean"
              style={{ maxWidth: "640px" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-clean">
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    Submit New University Application
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    Record formal application lodgement, offer deadlines, and scholarship assessments
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowSubmitModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitNewApplication}>
                <div className="modal-body-clean application-form-modern">
                  <section className="application-form-section">
                    <header><span>1</span><div><strong>Select student</strong><small>Search the registered student directory. The AECS code fills automatically.</small></div></header>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Search student *</label>
                        <input list="application-students" required value={studentSearch} onChange={event => selectStudent(event.target.value)} placeholder="Search by student name or AECS code" autoComplete="off" />
                        <datalist id="application-students">{students.map(student => <option key={student.id} value={`${student.fullName} · ${student.code}`}>{student.email}</option>)}</datalist>
                      </div>
                      <div className="form-group">
                        <label>Student Code / ID</label>
                        <input className="application-readonly-field" readOnly required value={newAppForm.studentCode} placeholder="Filled after selecting a student" />
                      </div>
                    </div>
                  </section>

                  <section className="application-form-section">
                    <header><span>2</span><div><strong>Study plan</strong><small>Options are connected to the active Abroad catalogue.</small></div></header>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Destination Country *</label>
                      <select required value={newAppForm.country} onChange={event => selectDestination(event.target.value)}>
                        <option value="">Select an active destination</option>
                        {catalogDestinations.map(destination => <option key={destination.code} value={destination.name}>{destination.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Target University *</label>
                      <input
                        list="application-universities"
                        required
                        value={newAppForm.universityName}
                        disabled={!newAppForm.country}
                        onChange={e => selectUniversity(e.target.value)}
                        placeholder={newAppForm.country ? "Search or add a university" : "Select a destination first"}
                        autoComplete="off"
                      />
                      <datalist id="application-universities">{universitiesForCountry.map(university => <option key={`${university.countryCode}-${university.name}`} value={university.name}>{university.country}</option>)}</datalist>
                      <small className="application-field-hint">Only universities linked to {newAppForm.country || "the selected destination"} are suggested. Type a new name to add one to this application.</small>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Degree / Course *</label>
                      <input
                        list="application-courses"
                        required
                        value={newAppForm.course}
                        onChange={e => setNewAppForm({ ...newAppForm, course: e.target.value })}
                        disabled={!newAppForm.country}
                        placeholder={newAppForm.country ? "Search or add a degree / course" : "Select a destination first"}
                        autoComplete="off"
                      />
                      <datalist id="application-courses">{coursesForSelection.map(course => <option key={course} value={course} />)}</datalist>
                      <small className="application-field-hint">Suggestions update when you select a university. A new course name can also be entered.</small>
                    </div>

                    <div className="form-group">
                      <label>Intake Cycle *</label>
                      <select
                        value={newAppForm.intake}
                        onChange={e => setNewAppForm({ ...newAppForm, intake: e.target.value })}
                      >
                        {newAppForm.intake && !["September 2026","July 2026","Fall 2026","Winter 2026","January 2027","Spring 2027"].includes(newAppForm.intake) && <option value={newAppForm.intake}>{newAppForm.intake}</option>}
                        <option value="September 2026">September 2026</option>
                        <option value="July 2026">July 2026</option>
                        <option value="Fall 2026">Fall 2026</option>
                        <option value="Winter 2026">Winter 2026</option>
                        <option value="January 2027">January 2027</option>
                        <option value="Spring 2027">Spring 2027</option>
                      </select>
                    </div>
                  </div>
                  </section>

                  <section className="application-form-section">
                    <header><span>3</span><div><strong>Application details</strong><small>Record financial terms, ownership and submission controls.</small></div></header>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Annual Tuition Fee *</label>
                      <input
                        type="text"
                        required
                        value={newAppForm.tuitionFee}
                        onChange={e => setNewAppForm({ ...newAppForm, tuitionFee: e.target.value })}
                        placeholder="e.g. £16,500 or A$34,000"
                      />
                    </div>

                    <div className="form-group">
                      <label>Scholarship Award / Note</label>
                      <input
                        type="text"
                        value={newAppForm.scholarship}
                        onChange={e => setNewAppForm({ ...newAppForm, scholarship: e.target.value })}
                        placeholder="e.g. £3,000 Early Bird Grant"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Initial Application Stage *</label>
                      <select
                        value={newAppForm.stage}
                        onChange={e => setNewAppForm({ ...newAppForm, stage: e.target.value as ApplicationStage })}
                      >
                        <option value="SUBMITTED">Under Review</option>
                        <option value="CONDITIONAL_OFFER">Conditional Offer</option>
                        <option value="UNCONDITIONAL_OFFER">Unconditional Offer</option>
                        <option value="CAS_ISSUED">CAS / I-20 Issued</option>
                        <option value="VISA_LODGED">Visa Lodged</option>
                        <option value="VISA_APPROVED">Visa Approved</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Application Officer *</label>
                      <input
                        type="text"
                        required
                        value={newAppForm.officer}
                        onChange={e => setNewAppForm({ ...newAppForm, officer: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Submission / offer deadline *</label>
                    <input type="date" required value={newAppForm.deadline} onChange={e => setNewAppForm({ ...newAppForm, deadline: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Application Notes & Special Requirements</label>
                    <textarea
                      rows={3}
                      value={newAppForm.notes}
                      onChange={e => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                      placeholder="Include portal credentials, pending documents, or condition remarks…"
                    />
                  </div>
                  </section>
                </div>

                <div className="modal-footer-clean">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowSubmitModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ background: "#F97316", borderColor: "#F97316" }}
                  >
                    <PlaneTakeoff size={15} />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: QUICK STAGE ADVANCEMENT
          ========================================================================= */}
      <AnimatePresence>
        {stageChangeApp && (
          <div className="modal-backdrop-clean" onClick={() => setStageChangeApp(null)} style={{ zIndex: 1600 }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-dialog-clean"
              style={{ maxWidth: "480px" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-clean">
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    Advance Admission Stage
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    {stageChangeApp.studentName} · {stageChangeApp.universityName}
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setStageChangeApp(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body-clean">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {STAGES.filter(s => s.key !== "ALL").map(st => {
                    const isCurrent = stageChangeApp.stage === st.key;

                    return (
                      <button
                        key={st.key}
                        type="button"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: isCurrent ? "2px solid #F97316" : "1px solid var(--border-subtle)",
                          background: isCurrent ? "rgba(249, 115, 22, 0.08)" : "var(--bg-card)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onClick={() => handleUpdateStage(st.key as ApplicationStage)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: isCurrent ? 700 : 500, color: "var(--text-main)" }}>
                            {st.label}
                          </span>
                        </div>
                        {isCurrent && <Check size={16} style={{ color: "#F97316" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          DRAWER: APPLICATION DOSSIER SLIDE-OVER
          ========================================================================= */}
      <AnimatePresence>
        {activeDossier && (
          <div className="modal-backdrop-clean" onClick={() => setActiveDossier(null)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(560px, 100vw)",
                background: "var(--bg-card)",
                borderLeft: "1px solid var(--border-strong)",
                boxShadow: "var(--shadow-xl)",
                zIndex: 1500,
                display: "flex",
                flexDirection: "column",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "18px 22px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--bg-card-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "var(--primary-navy)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "12px",
                    }}
                  >
                    <CountryDisplay country={activeDossier.country} size={18}/>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                      {activeDossier.studentName}
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {activeDossier.studentCode} · {activeDossier.universityName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setActiveDossier(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "22px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    background: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Degree / Course:</span>
                    <strong>{activeDossier.course}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Intake:</span>
                    <strong>{activeDossier.intake}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Destination Country:</span>
                    <strong><CountryDisplay country={activeDossier.country}/></strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Tuition Fee:</span>
                    <strong>{activeDossier.tuitionFee}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Scholarship:</span>
                    <strong style={{ color: "#10B981" }}>{activeDossier.scholarship}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Officer:</span>
                    <strong>{activeDossier.officer}</strong>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    Application Notes & Compliance Details
                  </strong>
                  <p style={{ fontSize: "12.5px", lineHeight: 1.6, background: "var(--bg-card-subtle)", padding: "12px", borderRadius: "4px", border: "1px solid var(--border-subtle)", margin: 0 }}>
                    {activeDossier.notes || "No special remarks recorded for this application."}
                  </p>
                </div>

                <div style={{ marginTop: "auto", display: "flex", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1, background: "#F97316", borderColor: "#F97316" }}
                    onClick={() => {
                      setStageChangeApp(activeDossier);
                    }}
                  >
                    <ChevronRight size={15} />
                    <span>Advance Application Stage</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ApplicationWorkspace;
