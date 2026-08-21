import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Info,
  Laptop,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MessageSquarePlus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MockTestResult, MockTestService, MockTestSlot } from "../../services/mockTestService";
import { useAuth } from "../auth/AuthProvider";

export function MockTestsWorkspace() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"results" | "slots" | "analytics">("results");
  const [results, setResults] = useState<MockTestResult[]>([]);
  const [slots, setSlots] = useState<MockTestSlot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("ALL");

  // Modals
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [activeResultDetail, setActiveResultDetail] = useState<MockTestResult | null>(null);

  // Score Entry Form
  const [scoreForm, setScoreForm] = useState({
    studentName: "",
    studentCode: "CLS-2026-001",
    testType: "IELTS Academic" as MockTestResult["testType"],
    testDate: new Date().toISOString().split("T")[0],
    venue: "Central Testing Hall · Room 201",
    examiner: "Unassigned",
    listening: "7.0",
    reading: "6.5",
    writing: "6.5",
    speaking: "7.0",
    overallScore: "7.0 Band",
    status: "Score Issued" as MockTestResult["status"],
    examinerFeedback: "Consistent performance across all modules. Ready for official exam booking.",
    targetAchieved: true,
  });

  // Slot Entry Form
  const [slotForm, setSlotForm] = useState({
    title: "Saturday Full-Length IELTS Simulation",
    testType: "IELTS Academic" as MockTestSlot["testType"],
    date: "2026-08-29 (Saturday)",
    time: "07:30 AM – 11:00 AM",
    room: "Testing Hall 01 · Audio Headphones Pack",
    invigilator: "Unassigned",
    totalSeats: 20,
    bookedSeats: 0,
    status: "OPEN" as MockTestSlot["status"],
  });

  const loadData = async () => {
    const [resData, slotData] = await Promise.all([
      MockTestService.getResults(),
      MockTestService.getSlots(),
    ]);
    setResults(resData);
    setSlots(slotData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (testTypeFilter !== "ALL" && r.testType !== testTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.studentName.toLowerCase().includes(q) ||
          r.studentCode.toLowerCase().includes(q) ||
          r.testCode.toLowerCase().includes(q) ||
          r.overallScore.toLowerCase().includes(q) ||
          r.examiner.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [results, testTypeFilter, searchQuery]);

  // Handle Score Submit
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreForm.studentName.trim()) return;

    await MockTestService.createResult({
      studentName: scoreForm.studentName.trim(),
      studentCode: scoreForm.studentCode.trim(),
      testType: scoreForm.testType,
      testDate: scoreForm.testDate,
      venue: scoreForm.venue.trim(),
      examiner: scoreForm.examiner.trim(),
      listening: scoreForm.listening,
      reading: scoreForm.reading,
      writing: scoreForm.writing,
      speaking: scoreForm.speaking,
      overallScore: scoreForm.overallScore.trim(),
      status: scoreForm.status,
      examinerFeedback: scoreForm.examinerFeedback.trim(),
      targetAchieved: scoreForm.targetAchieved,
    });

    await loadData();
    setShowAddResultModal(false);
    setScoreForm({
      studentName: "",
      studentCode: "CLS-2026-001",
      testType: "IELTS Academic",
      testDate: new Date().toISOString().split("T")[0],
      venue: "Central Testing Hall · Room 201",
      examiner: "Unassigned",
      listening: "7.0",
      reading: "6.5",
      writing: "6.5",
      speaking: "7.0",
      overallScore: "7.0 Band",
      status: "Score Issued",
      examinerFeedback: "Consistent performance across all modules. Ready for official exam booking.",
      targetAchieved: true,
    });
  };

  // Handle Slot Submit
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.title.trim()) return;

    await MockTestService.createSlot({
      title: slotForm.title.trim(),
      testType: slotForm.testType,
      date: slotForm.date.trim(),
      time: slotForm.time.trim(),
      room: slotForm.room.trim(),
      invigilator: slotForm.invigilator.trim(),
      totalSeats: Number(slotForm.totalSeats) || 20,
      bookedSeats: 0,
      status: "OPEN",
    });

    await loadData();
    setShowAddSlotModal(false);
  };

  // Metrics
  const totalMocks = results.length;
  const examReadyCount = results.filter(r => r.targetAchieved).length;

  return (
    <div className="page-container">
      {/* 1. Header Row */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow" style={{ color: "var(--accent-orange, #EA580C)" }}>
            TESTING & EVALUATION
          </span>
          <h2>Mock Tests & Evaluation Suite</h2>
          <p>
            Schedule full-length examination simulations, evaluate sectional band scores, and issue diagnostic report cards.
          </p>
        </div>

        <div className="page-header-actions" style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn-primary"
            style={{ background: "#0F172A", borderColor: "#0F172A", color: "#FFFFFF" }}
            onClick={() => setShowAddResultModal(true)}
          >
            <Plus size={15} />
            <span>+ Log Mock Test Scores</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowAddSlotModal(true)}
          >
            <Calendar size={15} />
            <span>+ Schedule Mock Slot</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/classes")}
          >
            <BookOpen size={15} />
            <span>← Classes Workspace</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Strip */}
      <div className="metrics-grid-4" style={{ marginBottom: "20px" }}>
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Tests Evaluated</span>
            <div className="metric-icon-wrap blue">
              <Award size={17} />
            </div>
          </div>
          <div className="metric-value">{totalMocks} Scorecards</div>
          <span className="metric-sub">IELTS, PTE & Duolingo mocks</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Average IELTS Band</span>
            <div className="metric-icon-wrap green">
              <Sparkles size={17} />
            </div>
          </div>
          <div className="metric-value">6.9 Band</div>
          <span className="metric-sub">Target for UK & Australia</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Average PTE Score</span>
            <div className="metric-icon-wrap purple">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="metric-value">65 / 90</div>
          <span className="metric-sub">Direct university entry benchmark</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Exam Ready</span>
            <div className="metric-icon-wrap amber">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="metric-value">{examReadyCount} Candidates</div>
          <span className="metric-sub">Cleared university cutoff</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="document-tabs">
        <button
          type="button"
          className={activeTab === "results" ? "active" : ""}
          onClick={() => setActiveTab("results")}
        >
          <Award size={15} />
          <span>Mock Results Ledger ({results.length})</span>
        </button>

        <button
          type="button"
          className={activeTab === "slots" ? "active" : ""}
          onClick={() => setActiveTab("slots")}
        >
          <CalendarClock size={15} />
          <span>Scheduled Mock Exam Slots ({slots.length})</span>
        </button>

        <button
          type="button"
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          <Target size={15} />
          <span>Diagnostic Readiness Tracker</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: RESULTS LEDGER
          ========================================================================= */}
      {activeTab === "results" && (
        <div className="crm-panel" style={{ padding: 0, overflow: "hidden" }}>
          {/* Search & Filter Toolbar */}
          <div
            style={{
              padding: "12px 18px",
              background: "var(--bg-card-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div className="search-input-wrap" style={{ width: "320px" }}>
              <Search size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, test code, or score…"
              />
            </div>

            <div className="toolbar-selects">
              <select
                className="crm-select"
                value={testTypeFilter}
                onChange={e => setTestTypeFilter(e.target.value)}
              >
                <option value="ALL">All Test Formats</option>
                <option value="IELTS Academic">IELTS Academic</option>
                <option value="PTE Academic">PTE Academic</option>
                <option value="Duolingo (DET)">Duolingo (DET)</option>
              </select>

              <button
                type="button"
                className="btn-primary"
                style={{ background: "#0F172A", borderColor: "#0F172A", padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setShowAddResultModal(true)}
              >
                <Plus size={14} />
                <span>+ Log Score</span>
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>TEST CODE</th>
                  <th>CANDIDATE</th>
                  <th>TEST TYPE</th>
                  <th>DATE</th>
                  <th>SECTIONAL SCORES (L · R · W · S)</th>
                  <th>OVERALL RESULT</th>
                  <th>TARGET STATUS</th>
                  <th>EXAMINER</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(res => (
                  <tr
                    key={res.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveResultDetail(res)}
                  >
                    <td>
                      <span className="account-code-cell" style={{ fontWeight: 700 }}>
                        {res.testCode}
                      </span>
                    </td>

                    <td>
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>{res.studentName}</strong>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{res.studentCode}</div>
                      </div>
                    </td>

                    <td>
                      <span className="badge-status counselling" style={{ fontSize: "11px", fontWeight: 700 }}>
                        {res.testType}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>{res.testDate}</span>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "6px", fontSize: "11.5px" }}>
                        <span style={{ padding: "2px 6px", background: "var(--bg-card-subtle)", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
                          <strong>L:</strong> {res.listening}
                        </span>
                        <span style={{ padding: "2px 6px", background: "var(--bg-card-subtle)", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
                          <strong>R:</strong> {res.reading}
                        </span>
                        <span style={{ padding: "2px 6px", background: "var(--bg-card-subtle)", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
                          <strong>W:</strong> {res.writing}
                        </span>
                        <span style={{ padding: "2px 6px", background: "var(--bg-card-subtle)", borderRadius: "3px", border: "1px solid var(--border-subtle)" }}>
                          <strong>S:</strong> {res.speaking}
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong style={{ fontSize: "14px", color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                        {res.overallScore}
                      </strong>
                    </td>

                    <td>
                      <span className={`badge-status ${res.targetAchieved ? "enrolled" : "counselling"}`}>
                        {res.targetAchieved ? "Target Met" : "Needs Review"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{res.examiner}</span>
                    </td>

                    <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "11.5px" }}
                        onClick={() => setActiveResultDetail(res)}
                      >
                        <span>Card</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SCHEDULED MOCK EXAM SLOTS
          ========================================================================= */}
      {activeTab === "slots" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "18px" }}>
          {slots.map(slot => {
            const bookedPct = Math.round((slot.bookedSeats / slot.totalSeats) * 100);

            return (
              <div
                key={slot.id}
                className="crm-panel"
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="badge-status counselling">{slot.testType}</span>
                  <span className={`badge-status ${slot.status === "OPEN" ? "enrolled" : "purple"}`}>
                    {slot.status}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, margin: "2px 0 4px" }}>
                    {slot.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                    <Calendar size={13} />
                    <span>{slot.date} · {slot.time}</span>
                  </div>
                </div>

                <div style={{ fontSize: "12px", background: "var(--bg-card-subtle)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Testing Venue:</span>
                    <strong>{slot.room}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Invigilator:</span>
                    <strong>{slot.invigilator}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span>Seat Bookings</span>
                    <strong>{slot.bookedSeats} / {slot.totalSeats} Seats ({bookedPct}%)</strong>
                  </div>
                  <div style={{ height: "6px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${bookedPct}%`,
                        background: slot.status === "FULL" ? "var(--danger, #DC2626)" : "var(--accent-blue)",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "auto", fontSize: "12px" }}
                  disabled={slot.status === "FULL"}
                >
                  <UserPlus size={13} />
                  <span>{slot.status === "FULL" ? "Slot Full" : "Book Candidate Slot"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          TAB 3: DIAGNOSTIC READINESS TRACKER
          ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="crm-panel">
          <div className="panel-header-bar">
            <div>
              <h3>Candidate Readiness & Target Score Analysis</h3>
              <p>Benchmarking student progress against destination university minimum cutoffs</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>TEST TYPE</th>
                  <th>TEST DATE</th>
                  <th>LATEST MOCK RESULT</th>
                  <th>STATUS</th>
                  <th>RECOMMENDED ACTION</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No candidate diagnostic scorecards recorded yet. Log mock test evaluation scores to view readiness analytics.
                    </td>
                  </tr>
                ) : (
                  results.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.studentName} ({r.studentCode})</strong></td>
                      <td>{r.testType}</td>
                      <td>{r.testDate}</td>
                      <td><strong style={{ color: r.targetAchieved ? "var(--success, #059669)" : "var(--danger, #DC2626)" }}>{r.overallScore} {r.targetAchieved ? "(Cleared)" : "(Below Target)"}</strong></td>
                      <td><span className={`badge-status ${r.targetAchieved ? "enrolled" : "counselling"}`}>{r.status}</span></td>
                      <td>{r.examinerFeedback || "Standard review"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LOG MOCK TEST SCORES
          ========================================================================= */}
      <AnimatePresence>
        {showAddResultModal && (
          <div className="modal-backdrop-clean" onClick={() => setShowAddResultModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-dialog-clean"
              style={{ maxWidth: "600px" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-clean">
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    Log Mock Test Evaluation Scores
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    Record listening, reading, writing, and speaking marks
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowAddResultModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveResult}>
                <div className="modal-body-clean">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Candidate Name *</label>
                      <input
                        type="text"
                        required
                        value={scoreForm.studentName}
                        onChange={e => setScoreForm({ ...scoreForm, studentName: e.target.value })}
                        placeholder="e.g. Rohan Shrestha"
                      />
                    </div>

                    <div className="form-group">
                      <label>Student Code *</label>
                      <input
                        type="text"
                        required
                        value={scoreForm.studentCode}
                        onChange={e => setScoreForm({ ...scoreForm, studentCode: e.target.value })}
                        placeholder="e.g. CLS-2026-001"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Test Format *</label>
                      <select
                        value={scoreForm.testType}
                        onChange={e => setScoreForm({ ...scoreForm, testType: e.target.value as any })}
                      >
                        <option value="IELTS Academic">IELTS Academic</option>
                        <option value="PTE Academic">PTE Academic</option>
                        <option value="Duolingo (DET)">Duolingo (DET)</option>
                        <option value="German A1">German A1</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Test Date *</label>
                      <input
                        type="date"
                        required
                        value={scoreForm.testDate}
                        onChange={e => setScoreForm({ ...scoreForm, testDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 4 Sectional Inputs */}
                  <div
                    style={{
                      background: "var(--bg-card-subtle)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 14px",
                      marginBottom: "12px",
                    }}
                  >
                    <strong style={{ fontSize: "12.5px", display: "block", marginBottom: "8px" }}>
                      Sectional Scores Breakdown
                    </strong>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                      <div className="form-group">
                        <label>Listening</label>
                        <input
                          type="text"
                          required
                          value={scoreForm.listening}
                          onChange={e => setScoreForm({ ...scoreForm, listening: e.target.value })}
                          placeholder="e.g. 7.0"
                        />
                      </div>
                      <div className="form-group">
                        <label>Reading</label>
                        <input
                          type="text"
                          required
                          value={scoreForm.reading}
                          onChange={e => setScoreForm({ ...scoreForm, reading: e.target.value })}
                          placeholder="e.g. 6.5"
                        />
                      </div>
                      <div className="form-group">
                        <label>Writing</label>
                        <input
                          type="text"
                          required
                          value={scoreForm.writing}
                          onChange={e => setScoreForm({ ...scoreForm, writing: e.target.value })}
                          placeholder="e.g. 6.5"
                        />
                      </div>
                      <div className="form-group">
                        <label>Speaking</label>
                        <input
                          type="text"
                          required
                          value={scoreForm.speaking}
                          onChange={e => setScoreForm({ ...scoreForm, speaking: e.target.value })}
                          placeholder="e.g. 7.0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Overall Band / Score *</label>
                      <input
                        type="text"
                        required
                        value={scoreForm.overallScore}
                        onChange={e => setScoreForm({ ...scoreForm, overallScore: e.target.value })}
                        placeholder="e.g. 7.0 Band or 66 / 90"
                      />
                    </div>

                    <div className="form-group">
                      <label>Examiner *</label>
                      <input
                        type="text"
                        required
                        value={scoreForm.examiner}
                        onChange={e => setScoreForm({ ...scoreForm, examiner: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Examiner Feedback & Action Plan *</label>
                    <textarea
                      rows={3}
                      required
                      value={scoreForm.examinerFeedback}
                      onChange={e => setScoreForm({ ...scoreForm, examinerFeedback: e.target.value })}
                      placeholder="Identify modules needing improvement and provide exam readiness assessment…"
                    />
                  </div>
                </div>

                <div className="modal-footer-clean">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddResultModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Award size={15} />
                    <span>Issue Mock Result</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          DRAWER: SCORECARD DOSSIER
          ========================================================================= */}
      <AnimatePresence>
        {activeResultDetail && (
          <div className="modal-backdrop-clean" onClick={() => setActiveResultDetail(null)}>
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
                  <Award size={22} style={{ color: "var(--accent-blue)" }} />
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                      Official Diagnostic Scorecard
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {activeResultDetail.testCode} · {activeResultDetail.testType}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setActiveResultDetail(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "22px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div
                  style={{
                    background: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Overall Test Band
                  </span>
                  <strong style={{ fontSize: "32px", color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                    {activeResultDetail.overallScore}
                  </strong>
                  <div style={{ marginTop: "6px" }}>
                    <span className={`badge-status ${activeResultDetail.targetAchieved ? "enrolled" : "counselling"}`}>
                      {activeResultDetail.targetAchieved ? "University Cutoff Met" : "Additional Prep Recommended"}
                    </span>
                  </div>
                </div>

                {/* Sectional Breakdown Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  <div style={{ padding: "10px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Listening</span>
                    <strong style={{ fontSize: "16px" }}>{activeResultDetail.listening}</strong>
                  </div>
                  <div style={{ padding: "10px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Reading</span>
                    <strong style={{ fontSize: "16px" }}>{activeResultDetail.reading}</strong>
                  </div>
                  <div style={{ padding: "10px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Writing</span>
                    <strong style={{ fontSize: "16px" }}>{activeResultDetail.writing}</strong>
                  </div>
                  <div style={{ padding: "10px", background: "var(--bg-card-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Speaking</span>
                    <strong style={{ fontSize: "16px" }}>{activeResultDetail.speaking}</strong>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    Master Examiner Feedback
                  </strong>
                  <p style={{ fontSize: "12.5px", lineHeight: 1.6, background: "var(--bg-card-subtle)", padding: "12px", borderRadius: "4px", border: "1px solid var(--border-subtle)", margin: 0 }}>
                    {activeResultDetail.examinerFeedback}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MockTestsWorkspace;
