import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building,
  Building2,
  Calculator,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  Info,
  Layers,
  MapPin,
  MessageCircle,
  MessageSquare,
  MessageSquarePlus,
  Percent,
  PlaneTakeoff,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CountryFlag } from "../../components/ui/PhoneInput";
import { CountryDisplay } from "../../components/ui/CountryDisplay";
import { AECS_AUTHORIZED_COUNTRIES, DestinationCountry } from "../../lib/destinationsData";
import { COUNTRY_METADATA } from "../../lib/countryMetadata.generated";
import { CounsellingService } from "../../services/counsellingService";
import { useAuth } from "../auth/AuthProvider";

export interface DestinationCatalog extends DestinationCountry {
  region: "English Speaking" | "Europe & Schengen" | "East Asia";
  universitiesCount: number;
  coursesCount: number;
  activeProcessing: number;
  visasApproved: number;
  visaSuccessRate: string;
  avgTuition: string;
  avgLivingCost: string;
  pswvWorkRights: string;
  acceptedEnglishTests: string[];
  intakeCycles: string[];
  keyHighlights: string;
}

export interface PartnerUniversity {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  ranking: string;
  popularCourses: string[];
  minPte: string;
  minIelts: string;
  scholarship: string;
  tuition: string;
  intake: string;
}

const INITIAL_DESTINATIONS_MASTER: DestinationCatalog[] = [];

const INITIAL_PARTNER_UNIVERSITIES: PartnerUniversity[] = [];

const DESTINATIONS_STORAGE_KEY = "aecs_destinations_catalog_v2";

const COUNTRY_AUTOFILL = COUNTRY_METADATA;

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  US: "United States",
  USA: "United States",
  "U.S.": "United States",
  "U.S.A.": "United States",
  AMERICA: "United States",
  UK: "United Kingdom",
  "U.K.": "United Kingdom",
  BRITAIN: "United Kingdom",
  "GREAT BRITAIN": "United Kingdom",
  UAE: "United Arab Emirates",
  "U.A.E.": "United Arab Emirates",
  KOREA: "South Korea",
  "REPUBLIC OF KOREA": "South Korea",
};
const UNIVERSITIES_STORAGE_KEY = "aecs_partner_universities_v2";

export function CounsellingDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"destinations" | "universities" | "consultations">("destinations");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCountryDetail, setActiveCountryDetail] = useState<DestinationCatalog | null>(null);

  // Persistent Destination & University Catalogs
  const [destinations, setDestinations] = useState<DestinationCatalog[]>(() => {
    const saved = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DESTINATIONS_MASTER;
  });

  const [universities, setUniversities] = useState<PartnerUniversity[]>(() => {
    const saved = localStorage.getItem(UNIVERSITIES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PARTNER_UNIVERSITIES;
  });

  // Modal States
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [showAddUniModal, setShowAddUniModal] = useState(false);

  // New Country Form State
  const [newCountryForm, setNewCountryForm] = useState({
    name: "",
    code: "",
    currency: "",
    dialCode: "",
    region: "Europe & Schengen" as DestinationCatalog["region"],
    universitiesCount: 0,
    coursesCount: 0,
    avgTuition: "",
    avgLivingCost: "",
    pswvWorkRights: "",
    popularIntakes: "",
    keyHighlights: "",
  });

  const updateCountryName = (name: string) => {
    const enteredName = name.trim();
    const canonicalName = COUNTRY_NAME_ALIASES[enteredName.toUpperCase()] ?? enteredName;
    const match = COUNTRY_AUTOFILL.find(country => country[0].toLowerCase() === canonicalName.toLowerCase());
    setNewCountryForm(current => ({
      ...current,
      name,
      code: match?.[1] ?? "",
      currency: match?.[2] ?? "",
      dialCode: match?.[3] ?? "",
      region: (match?.[4] ?? "Europe & Schengen") as DestinationCatalog["region"],
    }));
  };

  // New University Form State
  const [newUniForm, setNewUniForm] = useState({
    name: "",
    city: "",
    country: "",
    countryCode: "",
    ranking: "",
    popularCourses: "",
    minPte: "",
    minIelts: "",
    scholarship: "",
    tuition: "",
    intake: "",
  });

  // Student Consultations State
  const [records, setRecords] = useState<any[]>([]);
  const [consultForm, setConsultForm] = useState({
    studentCode: "",
    studentName: "",
    targetCountry: "",
    preferredCourse: "",
    counsellorName: profile?.full_name || "",
    stageOutcome: "University Shortlisted",
    followUpDate: "",
    notes: "",
  });

  useEffect(() => {
    CounsellingService.getRecords().then(data => {
      if (data && data.length > 0) setRecords(data);
    });
  }, []);

  // Save to local storage whenever modified
  const saveDestinations = (updated: DestinationCatalog[]) => {
    setDestinations(updated);
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const saveUniversities = (updated: PartnerUniversity[]) => {
    setUniversities(updated);
    localStorage.setItem(UNIVERSITIES_STORAGE_KEY, JSON.stringify(updated));
  };

  // Add Country Handler
  const handleCreateCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryForm.name.trim() || !newCountryForm.code.trim()) return;

    const formattedCode = newCountryForm.code.trim().toUpperCase().substring(0, 2);
    const intakesArray = newCountryForm.popularIntakes.split(",").map(s => s.trim()).filter(Boolean);

    const newDest: DestinationCatalog = {
      name: newCountryForm.name.trim(),
      code: formattedCode,
      currency: newCountryForm.currency.trim().toUpperCase(),
      dialCode: newCountryForm.dialCode.trim(),
      region: newCountryForm.region,
      universitiesCount: Number(newCountryForm.universitiesCount) || 5,
      coursesCount: Number(newCountryForm.coursesCount) || 35,
      activeProcessing: 0,
      visasApproved: 0,
      visaSuccessRate: "100%",
      avgTuition: newCountryForm.avgTuition.trim(),
      avgLivingCost: newCountryForm.avgLivingCost.trim(),
      pswvWorkRights: newCountryForm.pswvWorkRights.trim(),
      acceptedEnglishTests: ["IELTS (6.0+)", "PTE (56+)", "Duolingo"],
      popularIntakes: intakesArray.length > 0 ? intakesArray : ["September", "February"],
      intakeCycles: intakesArray.map(i => `${i} 2026`),
      keyHighlights: newCountryForm.keyHighlights.trim(),
    };

    const updated = [newDest, ...destinations.filter(d => d.code !== formattedCode)];
    saveDestinations(updated);
    setShowAddCountryModal(false);
    setNewCountryForm({
      name: "",
      code: "",
      currency: "",
      dialCode: "",
      region: "Europe & Schengen",
      universitiesCount: 0,
      coursesCount: 0,
      avgTuition: "",
      avgLivingCost: "",
      pswvWorkRights: "",
      popularIntakes: "",
      keyHighlights: "",
    });
  };

  // Add University Handler
  const handleCreateUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniForm.name.trim() || !newUniForm.city.trim()) return;

    const matchedCountry = destinations.find(d => d.name === newUniForm.country);
    const countryCode = matchedCountry ? matchedCountry.code : newUniForm.countryCode || "GB";
    const coursesArray = newUniForm.popularCourses.split(",").map(s => s.trim()).filter(Boolean);

    const newUni: PartnerUniversity = {
      id: `uni-${Date.now()}`,
      name: newUniForm.name.trim(),
      city: newUniForm.city.trim(),
      country: newUniForm.country,
      countryCode: countryCode,
      ranking: newUniForm.ranking.trim() || "Accredited Global Partner",
      popularCourses: coursesArray.length > 0 ? coursesArray : ["Undergraduate & Postgraduate Degrees"],
      minPte: newUniForm.minPte.trim() || "58+",
      minIelts: newUniForm.minIelts.trim() || "6.0",
      scholarship: newUniForm.scholarship.trim() || "Merit & Early Entry Grants",
      tuition: newUniForm.tuition.trim() || "Competitive Fee Structure",
      intake: newUniForm.intake.trim() || "September & January",
    };

    const updatedUnis = [newUni, ...universities];
    saveUniversities(updatedUnis);

    // Also increment the country's universities count
    const updatedDests = destinations.map(d =>
      d.name === newUniForm.country ? { ...d, universitiesCount: d.universitiesCount + 1 } : d
    );
    saveDestinations(updatedDests);

    setShowAddUniModal(false);
    setNewUniForm({
      name: "",
      city: "",
      country: "",
      countryCode: "",
      ranking: "",
      popularCourses: "",
      minPte: "",
      minIelts: "",
      scholarship: "",
      tuition: "",
      intake: "",
    });
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.notes.trim()) return;

    await CounsellingService.createRecord({
      studentName: consultForm.studentName,
      studentCode: consultForm.studentCode,
      counsellorName: consultForm.counsellorName,
      consultationDate: "Today, Just now",
      targetCountry: consultForm.targetCountry,
      preferredCourse: consultForm.preferredCourse,
      stageOutcome: consultForm.stageOutcome as any,
      followUpDate: consultForm.followUpDate,
      notes: consultForm.notes,
    });

    const updated = await CounsellingService.getRecords();
    setRecords(updated);
    setConsultForm({ ...consultForm, notes: "" });
  };

  // Filtered destination cards
  const filteredDestinations = useMemo(() => {
    return destinations.filter(d => {
      const matchRegion = selectedRegion === "ALL" || d.region === selectedRegion;
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.keyHighlights.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [destinations, selectedRegion, searchQuery]);

  // Aggregate Top Statistics
  const totalUniversitiesCount = destinations.reduce((acc, curr) => acc + curr.universitiesCount, 0);
  const totalCoursesCount = destinations.reduce((acc, curr) => acc + curr.coursesCount, 0);
  const totalApprovedCount = destinations.reduce((acc, curr) => acc + curr.visasApproved, 0);

  return (
    <div className="page-container">
      {/* 1. Header Row */}
      <div className="page-header-row">
        <div className="page-header-titles">
          <span className="page-category-eyebrow">GLOBAL DESTINATIONS & INSTITUTIONS</span>
          <h2>Abroad & Global Destinations Hub</h2>
          <p>
            Official catalog for the {destinations.length} AECS authorized study destinations, partner universities, and intake cycles.
          </p>
        </div>

        {/* Header Action Buttons with + Add Country and + Add University */}
        <div className="page-header-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* ORANGE ADD COUNTRY BUTTON (MATCHING USER SCREENSHOT) */}
          <button
            type="button"
            className="btn-primary"
            style={{ background: "var(--accent-orange, #EA580C)", borderColor: "var(--accent-orange, #EA580C)", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.25)" }}
            onClick={() => setShowAddCountryModal(true)}
          >
            <Plus size={16} />
            <span>Add country</span>
          </button>

          {/* ADD PARTNER UNIVERSITY BUTTON */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowAddUniModal(true)}
          >
            <Building2 size={15} />
            <span>Add University</span>
          </button>
        </div>
      </div>

      {/* 2. Flagship Metric Strip (Top 4 KPIs) */}
      <div className="metrics-grid-4" style={{ marginBottom: "24px" }}>
        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Destinations</span>
            <div className="metric-icon-wrap blue">
              <Globe size={18} />
            </div>
          </div>
          <div className="metric-value">{destinations.length} Countries</div>
          <span className="metric-sub">Active country catalogs</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Universities</span>
            <div className="metric-icon-wrap green">
              <Building2 size={18} />
            </div>
          </div>
          <div className="metric-value">{totalUniversitiesCount}+ Available</div>
          <span className="metric-sub">Available institutions</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Courses</span>
            <div className="metric-icon-wrap purple">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="metric-value">{totalCoursesCount}+ Programs</div>
          <span className="metric-sub">Configured programs</span>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <span className="metric-label">Approved</span>
            <div className="metric-icon-wrap amber">
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value">{totalApprovedCount} Outcomes</div>
          <span className="metric-sub">Successful outcomes</span>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="document-tabs">
        <button
          type="button"
          className={activeTab === "destinations" ? "active" : ""}
          onClick={() => setActiveTab("destinations")}
        >
          <Globe size={15} />
          <span>Destination directory ({destinations.length})</span>
        </button>

        <button
          type="button"
          className={activeTab === "universities" ? "active" : ""}
          onClick={() => setActiveTab("universities")}
        >
          <Building size={15} />
          <span>Partner Universities & Colleges ({universities.length})</span>
        </button>

        <button
          type="button"
          className={activeTab === "consultations" ? "active" : ""}
          onClick={() => setActiveTab("consultations")}
        >
          <MessageSquarePlus size={15} />
          <span>Student Consultation Logs ({records.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 16+ DESTINATION DIRECTORY GRID
          ========================================================================= */}
      {activeTab === "destinations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Filter and Search Bar */}
          <div className="filter-toolbar">
            <div className="search-input-wrap" style={{ width: "380px" }}>
              <Search size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country, code or currency…"
              />
            </div>

            <div className="toolbar-selects">
              <select
                className="crm-select"
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
              >
                <option value="ALL">All Regions ({destinations.length} Countries)</option>
                <option value="English Speaking">Top English Nations (UK, Aus, US, CA, NZ)</option>
                <option value="Europe & Schengen">Europe & Schengen (Germany, Finland, Malta, etc.)</option>
                <option value="East Asia">East Asia (Japan, South Korea)</option>
              </select>

              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--accent-orange, #EA580C)", borderColor: "var(--accent-orange, #EA580C)", padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setShowAddCountryModal(true)}
              >
                <Plus size={14} />
                <span>Add country</span>
              </button>
            </div>
          </div>

          {/* Country Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "18px",
            }}
          >
            {filteredDestinations.map(dest => (
              <motion.div
                key={dest.code}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="crm-panel"
                style={{
                  padding: "0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {/* Country Card Header (Matching User Screenshot style) */}
                <div
                  style={{
                    padding: "14px 18px",
                    background: "var(--bg-card-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CountryFlag code={dest.code} size={22} />
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
                        {dest.name}
                      </h3>
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {dest.code} · {dest.currency} ({dest.dialCode})
                      </span>
                    </div>
                  </div>

                  <span
                    className="status-pill"
                    style={{
                      background: "var(--success-soft, #ECFDF5)",
                      color: "var(--success, #059669)",
                      borderColor: "rgba(5, 150, 105, 0.2)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    Active
                  </span>
                </div>

                {/* 6-Metric Mini Ribbon */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1px",
                    background: "var(--border-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ background: "var(--bg-card)", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                      Universities
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>{dest.universitiesCount}</strong>
                  </div>

                  <div style={{ background: "var(--bg-card)", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                      Courses
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>{dest.coursesCount}</strong>
                  </div>

                  <div style={{ background: "var(--bg-card)", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                      Visa Grant %
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--success-text, #059669)" }}>{dest.visaSuccessRate}</strong>
                  </div>

                  <div style={{ background: "var(--bg-card)", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                      Processing
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--accent-blue)" }}>{dest.activeProcessing}</strong>
                  </div>

                  <div style={{ background: "var(--bg-card)", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                      Approved
                    </span>
                    <strong style={{ fontSize: "15px", color: "var(--success, #059669)" }}>{dest.visasApproved}</strong>
                  </div>

                  <div style={{ background: "var(--bg-card)", padding: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                      Currency
                    </span>
                    <strong style={{ fontSize: "13.5px", fontFamily: "var(--font-mono)" }}>{dest.currency}</strong>
                  </div>
                </div>

                {/* Country Insights */}
                <div style={{ padding: "14px 18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase" }}>
                      Estimated Annual Tuition:
                    </span>
                    <strong style={{ color: "var(--text-main)" }}>{dest.avgTuition}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase" }}>
                      Work Rights (PSWV):
                    </span>
                    <span style={{ color: "var(--accent-blue)", fontWeight: 600 }}>{dest.pswvWorkRights}</span>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase" }}>
                      Popular Intakes:
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {dest.popularIntakes.map(intk => (
                        <span
                          key={intk}
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "var(--bg-card-subtle)",
                            border: "1px solid var(--border-subtle)",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {intk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Manage Destination) */}
                <div
                  style={{
                    padding: "12px 18px",
                    borderTop: "1px solid var(--border-subtle)",
                    background: "var(--bg-card-subtle)",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: "100%", padding: "8px 12px", fontSize: "12.5px" }}
                    onClick={() => setActiveCountryDetail(dest)}
                  >
                    <Compass size={14} />
                    <span>Manage destination</span>
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Dash Box to Add Destination */}
            <div
              onClick={() => setShowAddCountryModal(true)}
              style={{
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "32px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
                background: "var(--bg-card-subtle)",
                transition: "all 0.15s ease",
                minHeight: "320px",
                textAlign: "center",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent-orange, #EA580C)";
                e.currentTarget.style.background = "var(--bg-card)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
                e.currentTarget.style.background = "var(--bg-card-subtle)";
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(234, 88, 12, 0.1)",
                  color: "var(--accent-orange, #EA580C)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={24} />
              </div>
              <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>Add New Study Destination</strong>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "240px", margin: 0 }}>
                Configure new country catalog, currency, tuition ranges, and partner institutions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PARTNER UNIVERSITIES DATABASE
          ========================================================================= */}
      {activeTab === "universities" && (
        <div className="crm-panel">
          <div className="panel-header-bar">
            <div>
              <h3>AECS Verified Partner Universities & Colleges</h3>
              <p>Direct institutional representation, articulation agreements, and entry requirements</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="status-pill">{universities.length} Verified Partners</span>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: "12px" }}
                onClick={() => setShowAddUniModal(true)}
              >
                <Building2 size={14} />
                <span>Add University</span>
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>University & Campus</th>
                  <th>Destination</th>
                  <th>Rank & Accreditation</th>
                  <th>Popular Programs</th>
                  <th>Min Entry Score</th>
                  <th>Scholarships</th>
                  <th>Annual Tuition</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {universities.map(uni => (
                  <tr key={uni.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "var(--text-main)" }}>{uni.name}</strong>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} />
                          <span>{uni.city}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <CountryFlag code={uni.countryCode} size={15} />
                        <span style={{ fontWeight: 600 }}>{uni.country}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge-status counselling" style={{ fontSize: "11px" }}>
                        {uni.ranking}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: "12px", color: "var(--text-main)" }}>
                        {Array.isArray(uni.popularCourses) ? uni.popularCourses.join(" · ") : uni.popularCourses}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: "11.5px" }}>
                        <div><strong>PTE:</strong> {uni.minPte}</div>
                        <div><strong>IELTS:</strong> {uni.minIelts}</div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "11.5px", color: "var(--success-text, #059669)", fontWeight: 600 }}>
                        {uni.scholarship}
                      </span>
                    </td>

                    <td>
                      <strong className="code-font" style={{ fontSize: "12.5px" }}>
                        {uni.tuition}
                      </strong>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "11.5px" }}
                        onClick={() => navigate("/applications")}
                      >
                        <span>Apply</span>
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
          TAB 3: STUDENT CONSULTATION & ADVISORY LOGS
          ========================================================================= */}
      {activeTab === "consultations" && (
        <div className="grid-2col" style={{ gridTemplateColumns: "1fr 1.3fr", gap: "20px" }}>
          {/* Left: Log Guidance Form */}
          <div className="crm-panel">
            <div className="panel-header-bar">
              <div>
                <h3>Log Student Consultation</h3>
                <p>Document advisory session, destination shortlisting & next steps</p>
              </div>
              <MessageSquarePlus size={18} style={{ color: "var(--accent-blue)" }} />
            </div>

            <div className="panel-body">
              <form onSubmit={handleSaveConsultation} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label>Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={consultForm.studentName}
                    onChange={e => setConsultForm({ ...consultForm, studentName: e.target.value })}
                    placeholder="e.g. Riya Sharma"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Target Country *</label>
                    <select
                      value={consultForm.targetCountry}
                      onChange={e => setConsultForm({ ...consultForm, targetCountry: e.target.value })}
                    >
                      {destinations.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Outcome *</label>
                    <select
                      value={consultForm.stageOutcome}
                      onChange={e => setConsultForm({ ...consultForm, stageOutcome: e.target.value })}
                    >
                      <option value="University Shortlisted">University Shortlisted</option>
                      <option value="Eligible for Direct Entry">Eligible for Direct Entry</option>
                      <option value="Language Prep Required">Language Prep Required</option>
                      <option value="Financial Documentation Review">Financial Documentation Review</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Consultation Notes & Remarks *</label>
                  <textarea
                    required
                    rows={4}
                    value={consultForm.notes}
                    onChange={e => setConsultForm({ ...consultForm, notes: e.target.value })}
                    placeholder="Document GPA, test scores, shortlisted institutions, and action items discussed…"
                  />
                </div>

                <button type="submit" className="btn-primary">
                  <UserCheck size={15} />
                  <span>Save Consultation Note</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Consultation History Log */}
          <div className="crm-panel">
            <div className="panel-header-bar">
              <div>
                <h3>Recent Consultation Records</h3>
                <p>Auditable log of counsellor-student guidance sessions</p>
              </div>
            </div>

            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "560px", overflowY: "auto" }}>
              {records.map((r: any) => (
                <div
                  key={r.id}
                  style={{
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "13px" }}>{r.studentName}</strong>
                      <span className="account-code-cell" style={{ marginLeft: "8px" }}>{r.studentCode}</span>
                    </div>
                    <span className="badge-status enrolled">{r.stageOutcome || "Completed"}</span>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-main)", background: "var(--bg-card)", padding: "8px 10px", borderRadius: "4px", margin: 0 }}>
                    {r.notes}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>Target: <strong><CountryDisplay country={r.targetCountry} size={14}/></strong></span>
                    <span>Counsellor: <strong>{r.counsellorName || "Unassigned"}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD COUNTRY / DESTINATION MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showAddCountryModal && (
          <div className="modal-backdrop-clean" onClick={() => setShowAddCountryModal(false)}>
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
                    Add New Study Destination Catalog
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    Configure country code, currency, tuition ranges, and work rights
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowAddCountryModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCountry}>
                <div className="modal-body-clean">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Country Name *</label>
                      <input
                        type="text"
                        required
                        list="aecs-country-catalog"
                        value={newCountryForm.name}
                        onChange={e => updateCountryName(e.target.value)}
                        placeholder="Start typing a country name"
                      />
                      <datalist id="aecs-country-catalog">{COUNTRY_AUTOFILL.map(country => <option key={country[1]} value={country[0]} />)}</datalist>
                    </div>

                    <div className="form-group">
                      <label>ISO 2-Letter Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        readOnly
                        value={newCountryForm.code}
                        placeholder="Generated automatically"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Currency Code *</label>
                      <input
                        type="text"
                        required
                        readOnly
                        value={newCountryForm.currency}
                        placeholder="Generated automatically"
                      />
                    </div>

                    <div className="form-group">
                      <label>Dialing Code *</label>
                      <input
                        type="text"
                        required
                        readOnly
                        value={newCountryForm.dialCode}
                        placeholder="Generated automatically"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Popular Intakes *</label>
                    <input
                      type="text"
                      required
                      value={newCountryForm.popularIntakes}
                      onChange={e => setNewCountryForm({ ...newCountryForm, popularIntakes: e.target.value })}
                      placeholder="e.g. September, February"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Estimated Annual Tuition *</label>
                      <input
                        type="text"
                        required
                        value={newCountryForm.avgTuition}
                        onChange={e => setNewCountryForm({ ...newCountryForm, avgTuition: e.target.value })}
                        placeholder="e.g. €7,000 – €14,000 / yr"
                      />
                    </div>

                    <div className="form-group">
                      <label>Post-Study Work Rights *</label>
                      <input
                        type="text"
                        required
                        value={newCountryForm.pswvWorkRights}
                        onChange={e => setNewCountryForm({ ...newCountryForm, pswvWorkRights: e.target.value })}
                        placeholder="e.g. 1.5 Years Stay-Back Visa"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Key Destination Highlights</label>
                    <textarea
                      rows={3}
                      value={newCountryForm.keyHighlights}
                      onChange={e => setNewCountryForm({ ...newCountryForm, keyHighlights: e.target.value })}
                      placeholder="Brief summary of why Nepali students should choose this country…"
                    />
                  </div>
                </div>

                <div className="modal-footer-clean">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddCountryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ background: "var(--accent-orange, #EA580C)", borderColor: "var(--accent-orange, #EA580C)" }}
                  >
                    <Plus size={15} />
                    <span>Save & Add Destination</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: ADD PARTNER UNIVERSITY MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showAddUniModal && (
          <div className="modal-backdrop-clean" onClick={() => setShowAddUniModal(false)}>
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
                    Add Partner University / Institution
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    Configure university agreements, campus, rankings, and entry requirements
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setShowAddUniModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUniversity}>
                <div className="modal-body-clean">
                  <div className="form-group">
                    <label>University / College Name *</label>
                    <input
                      type="text"
                      required
                      value={newUniForm.name}
                      onChange={e => setNewUniForm({ ...newUniForm, name: e.target.value })}
                      placeholder="e.g. University of Manchester, Fanshawe College"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>City & Campus *</label>
                      <input
                        type="text"
                        required
                        value={newUniForm.city}
                        onChange={e => setNewUniForm({ ...newUniForm, city: e.target.value })}
                        placeholder="e.g. Manchester, England"
                      />
                    </div>

                    <div className="form-group">
                      <label>Destination Country *</label>
                      <select
                        value={newUniForm.country}
                        onChange={e => setNewUniForm({ ...newUniForm, country: e.target.value })}
                      >
                        {destinations.map(d => (
                          <option key={d.code} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Global Rank / Accreditation</label>
                      <input
                        type="text"
                        value={newUniForm.ranking}
                        onChange={e => setNewUniForm({ ...newUniForm, ranking: e.target.value })}
                        placeholder="e.g. Top 100 QS World, DLI #O19395"
                      />
                    </div>

                    <div className="form-group">
                      <label>Annual Tuition Fee *</label>
                      <input
                        type="text"
                        required
                        value={newUniForm.tuition}
                        onChange={e => setNewUniForm({ ...newUniForm, tuition: e.target.value })}
                        placeholder="e.g. £18,500 / yr or A$32,000 / yr"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Minimum PTE Score</label>
                      <input
                        type="text"
                        value={newUniForm.minPte}
                        onChange={e => setNewUniForm({ ...newUniForm, minPte: e.target.value })}
                        placeholder="e.g. 58 (no band < 50)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Minimum IELTS Score</label>
                      <input
                        type="text"
                        value={newUniForm.minIelts}
                        onChange={e => setNewUniForm({ ...newUniForm, minIelts: e.target.value })}
                        placeholder="e.g. 6.0 (5.5 in each band)"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Available Scholarships</label>
                    <input
                      type="text"
                      value={newUniForm.scholarship}
                      onChange={e => setNewUniForm({ ...newUniForm, scholarship: e.target.value })}
                      placeholder="e.g. Up to £4,000 Academic Excellence Grant"
                    />
                  </div>

                  <div className="form-group">
                    <label>Popular Courses (comma separated)</label>
                    <input
                      type="text"
                      value={newUniForm.popularCourses}
                      onChange={e => setNewUniForm({ ...newUniForm, popularCourses: e.target.value })}
                      placeholder="e.g. MSc Data Science, MBA, Cyber Security, Nursing"
                    />
                  </div>
                </div>

                <div className="modal-footer-clean">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddUniModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Building2 size={15} />
                    <span>Save Partner University</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Country Detail Drawer Modal */}
      <AnimatePresence>
        {activeCountryDetail && (
          <div className="modal-backdrop-clean" onClick={() => setActiveCountryDetail(null)}>
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
                  <CountryFlag code={activeCountryDetail.code} size={20} />
                  <div>
                    <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0 }}>
                      {activeCountryDetail.name} Admissions Dossier
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Currency: {activeCountryDetail.currency} · Country Code: {activeCountryDetail.code}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setActiveCountryDetail(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "22px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Destination Overview & Highlights
                  </h4>
                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-main)", margin: 0 }}>
                    {activeCountryDetail.keyHighlights}
                  </p>
                </div>

                <div
                  style={{
                    background: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Partner Universities:</span>
                    <strong>{activeCountryDetail.universitiesCount} Institutions</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Average Tuition Cost:</span>
                    <strong>{activeCountryDetail.avgTuition}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Statutory Living Expenses:</span>
                    <strong>{activeCountryDetail.avgLivingCost}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Post-Study Work Permit:</span>
                    <strong style={{ color: "var(--accent-blue)" }}>{activeCountryDetail.pswvWorkRights}</strong>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "13px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Accepted English Language Qualifications
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {activeCountryDetail.acceptedEnglishTests.map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12.5px",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          background: "var(--bg-card-subtle)",
                        }}
                      >
                        <BadgeCheck size={15} style={{ color: "var(--success, #059669)" }} />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setActiveCountryDetail(null);
                      navigate("/leads");
                    }}
                  >
                    <Plus size={15} />
                    <span>Create Lead for {activeCountryDetail.name}</span>
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

export default CounsellingDashboard;
