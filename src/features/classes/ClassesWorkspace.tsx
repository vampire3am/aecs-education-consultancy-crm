import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Award, BookOpen, CalendarCheck2, Check, ChevronRight, Clock, GraduationCap, Plus, Search, TrendingUp, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassStudent, ClassStudentService } from "../../services/classStudentService";

interface BatchItem {
  id: string;
  batchCode: string;
  courseName: "IELTS Preparation" | "PTE Academic" | "Duolingo (DET)" | "German Language (A1/A2)" | "Japanese (NAT/JLPT)" | "Korean (TOPIK)";
  timing: string;
  instructor: string;
  enrolledStudents: number;
  maxCapacity: number;
  room: string;
  startDate: string;
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
}

const INITIAL_BATCHES: BatchItem[] = [];

const TEACHERS_LIST = [
  "Pradeep Joshi (Senior Master Trainer)",
  "Manisha Rai (Pearson Certified Trainer)",
  "Sushil Sharma (Goethe Certified)",
  "Bikash Thapa (JLPT Sensei)",
  "Ramesh Adhikari (TOEFL / SAT Faculty)",
  "Unassigned",
];

export function ClassesWorkspace() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"students" | "batches" | "attendance" | "faculty">("students");
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);

  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [activeStudentDetail, setActiveStudentDetail] = useState<ClassStudent | null>(null);
  const [attendance, setAttendance] = useState<Record<string,"PRESENT"|"ABSENT"|"LATE">>({});
  const [errorMessage,setErrorMessage]=useState("");

  // Exact Add Student Form State matching the user's uploaded screenshot!
  const [studentForm, setStudentForm] = useState({
    // S. Student Details
    fullName: "",
    phone: "",
    altPhone: "",
    email: "",
    gender: "Male" as ClassStudent["gender"],
    educationLevel: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
    recordStatus: "Active" as ClassStudent["recordStatus"],
    notes: "",

    // C. First Class Enrolment
    enrolledClass: "IELTS Preparation" as ClassStudent["enrolledClass"],
    teacher: "Pradeep Joshi (Senior Master Trainer)",
    startDate: new Date().toISOString().split("T")[0],
    expectedCompletion: "",
    batchName: "IELTS Morning A",
    schedule: "Sun–Fri, 7:00–8:30 AM",
    mode: "Classroom" as ClassStudent["mode"],
    classStatus: "Active" as ClassStudent["classStatus"],
    enrolmentNotes: "",
    feePaid: "NPR 12,500",
  });

  // Batch Form State
  const [batchForm, setBatchForm] = useState({
    batchCode: "",
    courseName: "IELTS Preparation" as BatchItem["courseName"],
    timing: "07:00 AM – 08:30 AM (Sun–Fri)",
    instructor: "Pradeep Joshi (Senior Master Trainer)",
    maxCapacity: 20,
    room: "Lab 01 · Central Audio Hub",
    startDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE" as BatchItem["status"],
  });

  // Load students
  const loadStudents = async () => {
    const [data,batchRows] = await Promise.all([ClassStudentService.getStudents(),ClassStudentService.getBatches()]);
    setStudents(data);setBatches(batchRows as BatchItem[]);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStudents();
  }, []);

  // Submit Handler for Add Class Student (Matching User's Screenshot Form)
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName.trim() || !studentForm.phone.trim()) return;

    await ClassStudentService.createStudent({
      fullName: studentForm.fullName.trim(),
      phone: studentForm.phone.trim(),
      altPhone: studentForm.altPhone.trim(),
      email: studentForm.email.trim(),
      gender: studentForm.gender,
      educationLevel: studentForm.educationLevel.trim(),
      guardianName: studentForm.guardianName.trim(),
      guardianPhone: studentForm.guardianPhone.trim(),
      address: studentForm.address.trim(),
      recordStatus: studentForm.recordStatus,
      notes: studentForm.notes.trim(),
      enrolledClass: studentForm.enrolledClass,
      teacher: studentForm.teacher,
      startDate: studentForm.startDate,
      expectedCompletion: studentForm.expectedCompletion,
      batchName: studentForm.batchName.trim(),
      schedule: studentForm.schedule.trim(),
      mode: studentForm.mode,
      classStatus: studentForm.classStatus,
      enrolmentNotes: studentForm.enrolmentNotes.trim(),
      feePaid: studentForm.feePaid.trim(),
    });

    await loadStudents();
    setShowAddStudentModal(false);
    setStudentForm({
      fullName: "",
      phone: "",
      altPhone: "",
      email: "",
      gender: "Male",
      educationLevel: "",
      guardianName: "",
      guardianPhone: "",
      address: "",
      recordStatus: "Active",
      notes: "",
      enrolledClass: "IELTS Preparation",
      teacher: "Pradeep Joshi (Senior Master Trainer)",
      startDate: new Date().toISOString().split("T")[0],
      expectedCompletion: "",
      batchName: "IELTS Morning A",
      schedule: "Sun–Fri, 7:00–8:30 AM",
      mode: "Classroom",
      classStatus: "Active",
      enrolmentNotes: "",
      feePaid: "NPR 12,500",
    });
  };

  // Submit Handler for Add Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.batchCode.trim()) return;

    await ClassStudentService.createBatch({...batchForm,batchCode:batchForm.batchCode.trim(),timing:batchForm.timing.trim(),maxCapacity:Number(batchForm.maxCapacity)||15,room:batchForm.room.trim()});
    await loadStudents();
    setShowAddBatchModal(false);
    setBatchForm({
      batchCode: "",
      courseName: "IELTS Preparation",
      timing: "07:00 AM – 08:30 AM (Sun–Fri)",
      instructor: "Pradeep Joshi (Senior Master Trainer)",
      maxCapacity: 20,
      room: "Lab 01 · Central Audio Hub",
      startDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    });
  };

  const markAttendance=async(studentId:string,status:"PRESENT"|"ABSENT"|"LATE")=>{try{await ClassStudentService.markAttendance(studentId,status);setAttendance(current=>({...current,[studentId]:status}));setErrorMessage("")}catch(error){setErrorMessage(error instanceof Error?error.message:"Unable to mark attendance")}};

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (courseFilter !== "ALL" && s.enrolledClass !== courseFilter) return false;
      if (statusFilter !== "ALL" && s.classStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.fullName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          s.batchName.toLowerCase().includes(q) ||
          s.teacher.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [students, courseFilter, statusFilter, searchQuery]);

  // Aggregate metrics
  const totalEnrolled = students.length;
  const activeBatchesCount = batches.filter(b => b.status === "ACTIVE").length;
  const classroomSeats = batches.reduce((acc, b) => acc + b.maxCapacity, 0);
  const occupiedSeats = batches.reduce((acc, b) => acc + b.enrolledStudents, 0);
  const occupancyRate = classroomSeats > 0 ? Math.round((occupiedSeats / classroomSeats) * 100) : 85;

  return (
    <div className="page-container">
      {/* 1. Header Row */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow" style={{ color: "var(--accent-blue)" }}>
            LANGUAGE & TEST PREPARATION
          </span>
          <h2>Classes & Test Preparation Workspace</h2>
          <p>
            Manage enrolled class students, language batches, faculty assignments, and daily attendance.
          </p>
        </div>

        <div className="page-header-actions" style={{ display: "flex", gap: "10px" }}>
          {/* Orange Primary Button matching user screenshot */}
          <button
            type="button"
            className="btn-primary"
            style={{ background: "var(--accent-orange, #EA580C)", borderColor: "var(--accent-orange, #EA580C)", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.25)" }}
            onClick={() => setShowAddStudentModal(true)}
          >
            <Plus size={16} />
            <span>+ Add class student</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowAddBatchModal(true)}
          >
            <BookOpen size={15} />
            <span>+ Create Batch</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/mocks")}
            title="Go to Mock Tests Suite"
          >
            <Award size={15} />
            <span>Mock Tests Suite →</span>
          </button>
        </div>
      </div>
      {errorMessage&&<div className="phase2-alert phase2-alert-error"><AlertCircle size={16}/>{errorMessage}<button type="button" onClick={()=>setErrorMessage("")}><X size={14}/></button></div>}

      {/* 2. Top 4 Metric Strip */}
      <div className="metrics-grid-4" style={{ marginBottom: "20px" }}>
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Enrolled Students</span>
            <div className="metric-icon-wrap blue">
              <Users size={17} />
            </div>
          </div>
          <div className="metric-value">{totalEnrolled} Active</div>
          <span className="metric-sub">IELTS, PTE & Language batches</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Active Batches</span>
            <div className="metric-icon-wrap green">
              <BookOpen size={17} />
            </div>
          </div>
          <div className="metric-value">{activeBatchesCount} Running</div>
          <span className="metric-sub">Morning, Day & Evening tracks</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Lab Occupancy Rate</span>
            <div className="metric-icon-wrap purple">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="metric-value">{occupancyRate}% Full</div>
          <span className="metric-sub">{occupiedSeats} / {classroomSeats} Total Capacity</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Certified Faculty</span>
            <div className="metric-icon-wrap amber">
              <GraduationCap size={17} />
            </div>
          </div>
          <div className="metric-value">6 Trainers</div>
          <span className="metric-sub">British Council & Pearson verified</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="document-tabs">
        <button
          type="button"
          className={activeTab === "students" ? "active" : ""}
          onClick={() => setActiveTab("students")}
        >
          <Users size={15} />
          <span>Class Students ({students.length})</span>
        </button>

        <button
          type="button"
          className={activeTab === "batches" ? "active" : ""}
          onClick={() => setActiveTab("batches")}
        >
          <BookOpen size={15} />
          <span>Course Batches & Schedules ({batches.length})</span>
        </button>

        <button
          type="button"
          className={activeTab === "attendance" ? "active" : ""}
          onClick={() => setActiveTab("attendance")}
        >
          <CalendarCheck2 size={15} />
          <span>Daily Roll Call Register</span>
        </button>

        <button
          type="button"
          className={activeTab === "faculty" ? "active" : ""}
          onClick={() => setActiveTab("faculty")}
        >
          <GraduationCap size={15} />
          <span>Faculty & Trainers</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CLASS STUDENTS DIRECTORY
          ========================================================================= */}
      {activeTab === "students" && (
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
                placeholder="Search class student, phone, or batch…"
              />
            </div>

            <div className="toolbar-selects">
              <select
                className="crm-select"
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value)}
              >
                <option value="ALL">All Courses</option>
                <option value="IELTS Preparation">IELTS Preparation</option>
                <option value="PTE Academic">PTE Academic</option>
                <option value="Duolingo (DET)">Duolingo (DET)</option>
                <option value="German Language (A1/A2)">German Language (A1/A2)</option>
                <option value="Japanese (NAT/JLPT)">Japanese (NAT/JLPT)</option>
              </select>

              <select
                className="crm-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--accent-orange, #EA580C)", borderColor: "var(--accent-orange, #EA580C)", padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setShowAddStudentModal(true)}
              >
                <Plus size={14} />
                <span>+ Add student</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>STUDENT CODE</th>
                  <th>STUDENT NAME</th>
                  <th>ENROLLED COURSE</th>
                  <th>BATCH & TIMING</th>
                  <th>INSTRUCTOR</th>
                  <th>MODE</th>
                  <th>START DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <Users size={28} style={{ opacity: 0.35 }} />
                        <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>No class students found</strong>
                        <span style={{ fontSize: "12px" }}>Register students directly into IELTS, PTE or Language batches.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(st => {
                    const initials = st.fullName
                      .split(" ")
                      .map(n => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr
                        key={st.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveStudentDetail(st)}
                      >
                        <td>
                          <span className="account-code-cell" style={{ fontWeight: 700 }}>
                            {st.studentCode}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
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
                              <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>{st.fullName}</strong>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{st.phone}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge-status counselling" style={{ fontSize: "11px", fontWeight: 700 }}>
                            {st.enrolledClass}
                          </span>
                        </td>

                        <td>
                          <div>
                            <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>{st.batchName}</strong>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{st.schedule}</div>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: "12px", color: "var(--text-main)" }}>{st.teacher}</span>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "var(--bg-card-subtle)",
                              border: "1px solid var(--border-subtle)",
                              fontWeight: 600,
                            }}
                          >
                            {st.mode}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>{st.startDate}</span>
                        </td>

                        <td>
                          <span className={`badge-status ${st.classStatus === "Active" ? "enrolled" : "purple"}`}>
                            {st.classStatus}
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "11.5px" }}
                            onClick={() => setActiveStudentDetail(st)}
                          >
                            <span>Dossier</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COURSE BATCHES & SCHEDULES
          ========================================================================= */}
      {activeTab === "batches" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "18px",
            }}
          >
            {batches.map(b => {
              const fillPct = Math.round((b.enrolledStudents / b.maxCapacity) * 100);

              return (
                <div
                  key={b.id}
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
                    <span className="account-code-cell" style={{ fontWeight: 700 }}>
                      {b.batchCode}
                    </span>
                    <span className="badge-status enrolled">{b.status}</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "2px 0 4px" }}>
                      {b.courseName}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                      <Clock size={13} />
                      <span>{b.timing}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", background: "var(--bg-card-subtle)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Instructor:</span>
                      <strong>{b.instructor}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Classroom Location:</span>
                      <strong>{b.room}</strong>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span>Batch Capacity Fill</span>
                      <strong>{b.enrolledStudents} / {b.maxCapacity} Seats ({fillPct}%)</strong>
                    </div>
                    <div style={{ height: "6px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${fillPct}%`,
                          background: fillPct >= 90 ? "var(--danger, #DC2626)" : "var(--accent-blue)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: "12px" }}
                      onClick={() => {
                        setStudentForm(f => ({ ...f, enrolledClass: b.courseName, batchName: b.batchCode, schedule: b.timing, teacher: b.instructor }));
                        setShowAddStudentModal(true);
                      }}
                    >
                      <UserPlus size={13} />
                      <span>Enroll Student</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DAILY ROLL CALL REGISTER
          ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="crm-panel">
          <div className="panel-header-bar">
            <div>
              <h3>Daily Class Attendance & Punch Register</h3>
              <p>Mark presence for morning and afternoon test preparation sessions</p>
            </div>
            <span className="status-pill">Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>

          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>STUDENT CODE</th>
                  <th>STUDENT NAME</th>
                  <th>BATCH</th>
                  <th>TIMING</th>
                  <th>TODAY'S ATTENDANCE STATUS</th>
                  <th style={{ textAlign: "right" }}>QUICK MARK</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td><strong className="code-font">{s.studentCode}</strong></td>
                    <td><strong style={{ color: "var(--text-main)" }}>{s.fullName}</strong></td>
                    <td><span className="badge-status counselling">{s.batchName}</span></td>
                    <td><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.schedule}</span></td>
                    <td>
                      <span className={`badge-status ${attendance[s.id]==="ABSENT"?"visa":attendance[s.id]==="LATE"?"counselling":"enrolled"}`}>
                        <Check size={11} style={{ display: "inline", marginRight: "3px" }} />
                        {attendance[s.id]??"Not marked"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button type="button" onClick={()=>markAttendance(s.id,"PRESENT")} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--success, #059669)" }}>P</button>
                        <button type="button" onClick={()=>markAttendance(s.id,"ABSENT")} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger, #DC2626)" }}>A</button>
                        <button type="button" onClick={()=>markAttendance(s.id,"LATE")} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--accent-orange, #EA580C)" }}>L</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FACULTY & INSTRUCTORS
          ========================================================================= */}
      {activeTab === "faculty" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "18px",
          }}
        >
          {TEACHERS_LIST.filter(t => t !== "Unassigned").map((teacher, idx) => (
            <div key={idx} className="crm-panel" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--primary-navy)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {teacher.charAt(0)}
                </div>
                <div>
                  <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>{teacher}</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                    Official Faculty Member
                  </span>
                </div>
              </div>

              <div style={{ fontSize: "12px", background: "var(--bg-card-subtle)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Active Batches:</span>
                  <strong>2 Batches Running</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Students:</span>
                  <strong>32 Students</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          EXACT ADD CLASS STUDENT MODAL (MATCHING USER SCREENSHOT!)
          ========================================================================= */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className="modal-backdrop-clean" onClick={() => setShowAddStudentModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-dialog-clean"
              style={{ maxWidth: "720px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Top Header (Matching image header with eyebrow and orange plus) */}
              <div
                style={{
                  padding: "16px 22px",
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "var(--bg-card-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--accent-blue)", fontWeight: 700, display: "block", marginBottom: "2px" }}>
                    ← Classes
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(234, 88, 12, 0.12)",
                        color: "var(--accent-orange, #EA580C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      +
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0 }}>
                      Add class student
                    </h3>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    This record is independent from Leads and consultancy Students.
                  </p>
                </div>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowAddStudentModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
                {/* SECTION 1: S · Student details (Matching Screenshot Card 1) */}
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 18px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: "rgba(37, 99, 235, 0.1)",
                        color: "var(--accent-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      S
                    </div>
                    <strong style={{ fontSize: "13.5px" }}>Student details</strong>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Full name *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.fullName}
                        onChange={e => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.phone}
                        onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })}
                        placeholder="+977 98XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Alternate phone</label>
                      <input
                        type="text"
                        value={studentForm.altPhone}
                        onChange={e => setStudentForm({ ...studentForm, altPhone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={studentForm.email}
                        onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={studentForm.gender}
                        onChange={e => setStudentForm({ ...studentForm, gender: e.target.value as ClassStudent["gender"] })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Education level</label>
                      <input
                        type="text"
                        value={studentForm.educationLevel}
                        onChange={e => setStudentForm({ ...studentForm, educationLevel: e.target.value })}
                        placeholder="e.g. Grade 12, Bachelor's"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Guardian name</label>
                      <input
                        type="text"
                        value={studentForm.guardianName}
                        onChange={e => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Guardian phone</label>
                      <input
                        type="text"
                        value={studentForm.guardianPhone}
                        onChange={e => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      rows={2}
                      value={studentForm.address}
                      onChange={e => setStudentForm({ ...studentForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Record status</label>
                    <select
                      value={studentForm.recordStatus}
                      onChange={e => setStudentForm({ ...studentForm, recordStatus: e.target.value as ClassStudent["recordStatus"] })}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Dropped">Dropped</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      rows={2}
                      value={studentForm.notes}
                      onChange={e => setStudentForm({ ...studentForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* SECTION 2: C · First class enrolment (Matching Screenshot Card 2) */}
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px 18px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: "rgba(5, 150, 105, 0.1)",
                        color: "var(--success, #059669)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      C
                    </div>
                    <strong style={{ fontSize: "13.5px" }}>First class enrolment</strong>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Class *</label>
                      <select
                        value={studentForm.enrolledClass}
                        onChange={e => setStudentForm({ ...studentForm, enrolledClass: e.target.value as ClassStudent["enrolledClass"] })}
                      >
                        <option value="IELTS Preparation">IELTS Preparation</option>
                        <option value="PTE Academic">PTE Academic</option>
                        <option value="Duolingo (DET)">Duolingo (DET)</option>
                        <option value="TOEFL iBT">TOEFL iBT</option>
                        <option value="German Language (A1/A2)">German Language (A1/A2)</option>
                        <option value="Japanese (NAT/JLPT)">Japanese (NAT/JLPT)</option>
                        <option value="Korean (TOPIK)">Korean (TOPIK)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Teacher</label>
                      <select
                        value={studentForm.teacher}
                        onChange={e => setStudentForm({ ...studentForm, teacher: e.target.value })}
                      >
                        {TEACHERS_LIST.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Start date *</label>
                      <input
                        type="date"
                        required
                        value={studentForm.startDate}
                        onChange={e => setStudentForm({ ...studentForm, startDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Expected completion</label>
                      <input
                        type="date"
                        value={studentForm.expectedCompletion}
                        onChange={e => setStudentForm({ ...studentForm, expectedCompletion: e.target.value })}
                      />
                      <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
                        Calculated automatically from the class mode and start date.
                      </small>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Batch</label>
                      <input
                        type="text"
                        value={studentForm.batchName}
                        onChange={e => setStudentForm({ ...studentForm, batchName: e.target.value })}
                        placeholder="e.g. IELTS Morning A"
                      />
                    </div>

                    <div className="form-group">
                      <label>Class schedule</label>
                      <input
                        type="text"
                        value={studentForm.schedule}
                        onChange={e => setStudentForm({ ...studentForm, schedule: e.target.value })}
                        placeholder="e.g. Sun–Fri, 7:00–8:30 AM"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Mode</label>
                      <select
                        value={studentForm.mode}
                        onChange={e => setStudentForm({ ...studentForm, mode: e.target.value as ClassStudent["mode"] })}
                      >
                        <option value="Classroom">Classroom</option>
                        <option value="Online">Online</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                      <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
                        CrashCourse is available for IELTS, PTE and DET only.
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Class status</label>
                      <select
                        value={studentForm.classStatus}
                        onChange={e => setStudentForm({ ...studentForm, classStatus: e.target.value as ClassStudent["classStatus"] })}
                      >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Enrolment notes</label>
                    <textarea
                      rows={2}
                      value={studentForm.enrolmentNotes}
                      onChange={e => setStudentForm({ ...studentForm, enrolmentNotes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bottom Footer Buttons (Matching Screenshot) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddStudentModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ background: "var(--accent-orange, #EA580C)", borderColor: "var(--accent-orange, #EA580C)", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.25)" }}
                  >
                    Create student record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: CREATE NEW BATCH
          ========================================================================= */}
      <AnimatePresence>
        {showAddBatchModal && (
          <div className="modal-backdrop-clean" onClick={() => setShowAddBatchModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-dialog-clean"
              style={{ maxWidth: "560px" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-clean">
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    Create New Course Batch
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    Configure timing, room, teacher and seat capacity
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowAddBatchModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBatch}>
                <div className="modal-body-clean">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Batch Code *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.batchCode}
                        onChange={e => setBatchForm({ ...batchForm, batchCode: e.target.value })}
                        placeholder="e.g. BATCH-IELTS-M05"
                      />
                    </div>

                    <div className="form-group">
                      <label>Course *</label>
                      <select
                        value={batchForm.courseName}
                        onChange={e => setBatchForm({ ...batchForm, courseName: e.target.value as BatchItem["courseName"] })}
                      >
                        <option value="IELTS Preparation">IELTS Preparation</option>
                        <option value="PTE Academic">PTE Academic</option>
                        <option value="Duolingo (DET)">Duolingo (DET)</option>
                        <option value="German Language (A1/A2)">German Language (A1/A2)</option>
                        <option value="Japanese (NAT/JLPT)">Japanese (NAT/JLPT)</option>
                        <option value="Korean (TOPIK)">Korean (TOPIK)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Schedule & Timing *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.timing}
                        onChange={e => setBatchForm({ ...batchForm, timing: e.target.value })}
                        placeholder="e.g. 07:00 AM – 08:30 AM (Sun–Fri)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Instructor *</label>
                      <select
                        value={batchForm.instructor}
                        onChange={e => setBatchForm({ ...batchForm, instructor: e.target.value })}
                      >
                        {TEACHERS_LIST.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Room / Lab Location</label>
                      <input
                        type="text"
                        value={batchForm.room}
                        onChange={e => setBatchForm({ ...batchForm, room: e.target.value })}
                        placeholder="e.g. Lab 01 · Audio Hub"
                      />
                    </div>

                    <div className="form-group">
                      <label>Max Seat Capacity</label>
                      <input
                        type="number"
                        value={batchForm.maxCapacity}
                        onChange={e => setBatchForm({ ...batchForm, maxCapacity: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer-clean">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddBatchModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <BookOpen size={15} />
                    <span>Save Course Batch</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          DRAWER: STUDENT PROFILE & DOSSIER
          ========================================================================= */}
      <AnimatePresence>
        {activeStudentDetail && (
          <div className="modal-backdrop-clean" onClick={() => setActiveStudentDetail(null)}>
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
                      borderRadius: "50%",
                      background: "var(--primary-navy)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                    }}
                  >
                    {activeStudentDetail.studentCode.split("-").pop()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                      {activeStudentDetail.fullName}
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {activeStudentDetail.studentCode} · {activeStudentDetail.enrolledClass}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setActiveStudentDetail(null)}
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
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Phone:</span>
                    <strong>{activeStudentDetail.phone}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Email:</span>
                    <strong>{activeStudentDetail.email || "—"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Guardian:</span>
                    <strong>{activeStudentDetail.guardianName || "—"} ({activeStudentDetail.guardianPhone || "—"})</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Address:</span>
                    <strong>{activeStudentDetail.address || "—"}</strong>
                  </div>
                </div>

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
                  <strong style={{ fontSize: "13px" }}>Enrolment & Batch Details</strong>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Batch Name:</span>
                    <strong>{activeStudentDetail.batchName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Timing:</span>
                    <strong>{activeStudentDetail.schedule}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Instructor:</span>
                    <strong>{activeStudentDetail.teacher}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Mode:</span>
                    <strong>{activeStudentDetail.mode}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Start Date:</span>
                    <strong>{activeStudentDetail.startDate}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Fee Status:</span>
                    <strong style={{ color: "var(--success, #059669)" }}>{activeStudentDetail.feePaid}</strong>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>Notes & Study Goals</strong>
                  <p style={{ fontSize: "12.5px", color: "var(--text-main)", background: "var(--bg-card-subtle)", padding: "12px", borderRadius: "4px", border: "1px solid var(--border-subtle)", margin: 0 }}>
                    {activeStudentDetail.notes || "No special remarks recorded."}
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

export default ClassesWorkspace;
