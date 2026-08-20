import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { AECS_STAFF_18 } from "../../services/messagingService";

export type StaffRole =
  | "ADMIN"
  | "DIRECTOR"
  | "SENIOR_COUNSELLOR"
  | "COUNSELLOR"
  | "VISA_OFFICER"
  | "ACCOUNTANT"
  | "FRONT_DESK"
  | "FACULTY"
  | "MARKETING"
  | "IT_ADMIN";

export interface RolePermissions {
  dashboard: boolean;
  leads: boolean;
  students: boolean;
  counselling: boolean;
  applications: boolean;
  b2b: boolean;
  classes: boolean;
  mocks: boolean;
  documents: boolean;
  finance: boolean;
  reports: boolean;
  hrms: boolean;
  settings: boolean;
  messages: boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, RolePermissions> = {
  ADMIN: {
    dashboard: true,
    leads: true,
    students: true,
    counselling: true,
    applications: true,
    b2b: true,
    classes: true,
    mocks: true,
    documents: true,
    finance: true,
    reports: true,
    hrms: true,
    settings: true,
    messages: true,
  },
  DIRECTOR: {
    dashboard: true,
    leads: true,
    students: true,
    counselling: true,
    applications: true,
    b2b: true,
    classes: true,
    mocks: true,
    documents: true,
    finance: true,
    reports: true,
    hrms: true,
    settings: false,
    messages: true,
  },
  SENIOR_COUNSELLOR: {
    dashboard: true,
    leads: true,
    students: true,
    counselling: true,
    applications: true,
    b2b: true,
    classes: false,
    mocks: false,
    documents: true,
    finance: false,
    reports: false,
    hrms: false,
    settings: false,
    messages: true,
  },
  COUNSELLOR: {
    dashboard: true,
    leads: true,
    students: true,
    counselling: true,
    applications: true,
    b2b: false,
    classes: false,
    mocks: false,
    documents: true,
    finance: false,
    reports: false,
    hrms: false,
    settings: false,
    messages: true,
  },
  VISA_OFFICER: {
    dashboard: true,
    leads: false,
    students: true,
    counselling: false,
    applications: true,
    b2b: false,
    classes: false,
    mocks: false,
    documents: true,
    finance: false,
    reports: false,
    hrms: false,
    settings: false,
    messages: true,
  },
  FACULTY: {
    dashboard: true,
    leads: false,
    students: true,
    counselling: false,
    applications: false,
    b2b: false,
    classes: true,
    mocks: true,
    documents: false,
    finance: false,
    reports: false,
    hrms: false,
    settings: false,
    messages: true,
  },
  ACCOUNTANT: {
    dashboard: true,
    leads: false,
    students: true,
    counselling: false,
    applications: false,
    b2b: true,
    classes: false,
    mocks: false,
    documents: false,
    finance: true,
    reports: true,
    hrms: false,
    settings: false,
    messages: true,
  },
  FRONT_DESK: {
    dashboard: true,
    leads: true,
    students: true,
    counselling: false,
    applications: false,
    b2b: false,
    classes: true,
    mocks: true,
    documents: false,
    finance: false,
    reports: false,
    hrms: false,
    settings: false,
    messages: true,
  },
  MARKETING: {
    dashboard: true,
    leads: true,
    students: true,
    counselling: false,
    applications: false,
    b2b: true,
    classes: false,
    mocks: false,
    documents: false,
    finance: false,
    reports: true,
    hrms: false,
    settings: false,
    messages: true,
  },
  IT_ADMIN: {
    dashboard: true,
    leads: false,
    students: false,
    counselling: false,
    applications: false,
    b2b: false,
    classes: false,
    mocks: false,
    documents: true,
    finance: false,
    reports: false,
    hrms: true,
    settings: true,
    messages: true,
  },
};

export interface StaffProfile {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  job_title: string;
  is_active: boolean;
  branch: string;
  phone?: string;
  department: string;
  avatarBg?: string;
}

// Map all 18 registered staff members to authenticatable profiles with distinct roles
export const DEMO_PROFILES: Record<string, StaffProfile> = {
  // 1. Owner & Managing Director
  "admin@abroad.edu.np": {
    id: "staff-1",
    full_name: "AECS Administrator",
    email: "admin@abroad.edu.np",
    role: "ADMIN",
    job_title: "Managing Director & Operations Head",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9851000001",
    department: "Executive Management",
    avatarBg: "#2563EB",
  },
  "admin@aecs.edu.np": {
    id: "staff-1",
    full_name: "AECS Administrator",
    email: "admin@aecs.edu.np",
    role: "ADMIN",
    job_title: "Managing Director & Operations Head",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9851000001",
    department: "Executive Management",
    avatarBg: "#2563EB",
  },

  // 2. Senior Head Counsellor · UK & Europe
  "counsellor@abroad.edu.np": {
    id: "staff-2",
    full_name: "Sita Adhikari",
    email: "counsellor@abroad.edu.np",
    role: "SENIOR_COUNSELLOR",
    job_title: "Senior Head Counsellor · UK & Europe",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9841230002",
    department: "Counselling & Admissions",
    avatarBg: "#8B5CF6",
  },
  "sita.adhikari@aecs.edu.np": {
    id: "staff-2",
    full_name: "Sita Adhikari",
    email: "sita.adhikari@aecs.edu.np",
    role: "SENIOR_COUNSELLOR",
    job_title: "Senior Head Counsellor · UK & Europe",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9841230002",
    department: "Counselling & Admissions",
    avatarBg: "#8B5CF6",
  },

  // 3. Senior Visa & Compliance Officer
  "visa@abroad.edu.np": {
    id: "staff-3",
    full_name: "Binod Maharjan",
    email: "visa@abroad.edu.np",
    role: "VISA_OFFICER",
    job_title: "Senior Visa & Compliance Officer",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9801980003",
    department: "Visa & Compliance Desk",
    avatarBg: "#059669",
  },
  "binod.maharjan@aecs.edu.np": {
    id: "staff-3",
    full_name: "Binod Maharjan",
    email: "binod.maharjan@aecs.edu.np",
    role: "VISA_OFFICER",
    job_title: "Senior Visa & Compliance Officer",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9801980003",
    department: "Visa & Compliance Desk",
    avatarBg: "#059669",
  },

  // 4. Senior Master Trainer · IELTS & PTE
  "faculty@abroad.edu.np": {
    id: "staff-4",
    full_name: "Pradeep Joshi",
    email: "faculty@abroad.edu.np",
    role: "FACULTY",
    job_title: "Senior Master Trainer · IELTS & PTE",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9812340004",
    department: "Test Preparation & Language Lab",
    avatarBg: "#D97706",
  },
  "pradeep.joshi@aecs.edu.np": {
    id: "staff-4",
    full_name: "Pradeep Joshi",
    email: "pradeep.joshi@aecs.edu.np",
    role: "FACULTY",
    job_title: "Senior Master Trainer · IELTS & PTE",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9812340004",
    department: "Test Preparation & Language Lab",
    avatarBg: "#D97706",
  },

  // 5. Pearson Certified Trainer · PTE Academic
  "manisha.rai@aecs.edu.np": {
    id: "staff-5",
    full_name: "Manisha Rai",
    email: "manisha.rai@aecs.edu.np",
    role: "FACULTY",
    job_title: "Pearson Certified Trainer · PTE Academic",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9851120005",
    department: "Test Preparation & Language Lab",
    avatarBg: "#EC4899",
  },

  // 6. Faculty Lead · German Language
  "sushil.sharma@aecs.edu.np": {
    id: "staff-6",
    full_name: "Sushil Sharma",
    email: "sushil.sharma@aecs.edu.np",
    role: "FACULTY",
    job_title: "Faculty Lead · German Language",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9860110006",
    department: "Test Preparation & Language Lab",
    avatarBg: "#10B981",
  },

  // 7. Chief Finance Officer & Accounts Lead
  "accounts@abroad.edu.np": {
    id: "staff-7",
    full_name: "Ramesh Shrestha",
    email: "accounts@abroad.edu.np",
    role: "ACCOUNTANT",
    job_title: "Chief Finance Officer & Accounts Lead",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9803440007",
    department: "Finance & Accounts",
    avatarBg: "#0284C7",
  },
  "ramesh.shrestha@aecs.edu.np": {
    id: "staff-7",
    full_name: "Ramesh Shrestha",
    email: "ramesh.shrestha@aecs.edu.np",
    role: "ACCOUNTANT",
    job_title: "Chief Finance Officer & Accounts Lead",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9803440007",
    department: "Finance & Accounts",
    avatarBg: "#0284C7",
  },

  // 8. Front Desk & Lead Intake Coordinator
  "frontdesk@abroad.edu.np": {
    id: "staff-8",
    full_name: "Sunita KC",
    email: "frontdesk@abroad.edu.np",
    role: "FRONT_DESK",
    job_title: "Front Desk & Lead Intake Coordinator",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9841550008",
    department: "Front Desk & Intake",
    avatarBg: "#F59E0B",
  },
  "sunita.kc@aecs.edu.np": {
    id: "staff-8",
    full_name: "Sunita KC",
    email: "sunita.kc@aecs.edu.np",
    role: "FRONT_DESK",
    job_title: "Front Desk & Lead Intake Coordinator",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9841550008",
    department: "Front Desk & Intake",
    avatarBg: "#F59E0B",
  },

  // 9. USA Admissions & SAT Specialist
  "bikram.thapa@aecs.edu.np": {
    id: "staff-9",
    full_name: "Bikram Thapa",
    email: "bikram.thapa@aecs.edu.np",
    role: "COUNSELLOR",
    job_title: "USA Admissions & SAT Specialist",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9851660009",
    department: "Counselling & Admissions",
    avatarBg: "#6366F1",
  },

  // 10. Documentation & Notary Officer
  "anjali.shrestha@aecs.edu.np": {
    id: "staff-10",
    full_name: "Anjali Shrestha",
    email: "anjali.shrestha@aecs.edu.np",
    role: "VISA_OFFICER",
    job_title: "Documentation & Notary Officer",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9860770010",
    department: "Visa & Compliance Desk",
    avatarBg: "#14B8A6",
  },

  // 11. B2B Partner Relations Manager
  "deepak.poudel@aecs.edu.np": {
    id: "staff-11",
    full_name: "Deepak Poudel",
    email: "deepak.poudel@aecs.edu.np",
    role: "MARKETING",
    job_title: "B2B Partner Relations Manager",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9801880011",
    department: "B2B & Institutional Partnerships",
    avatarBg: "#EA580C",
  },

  // 12. Study Abroad Counsellor · Australia & NZ
  "kavita.dahal@aecs.edu.np": {
    id: "staff-12",
    full_name: "Kavita Dahal",
    email: "kavita.dahal@aecs.edu.np",
    role: "COUNSELLOR",
    job_title: "Study Abroad Counsellor · Australia & NZ",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9841990012",
    department: "Counselling & Admissions",
    avatarBg: "#84CC16",
  },

  // 13. Digital Marketing & Intake Lead
  "pravin.gautam@aecs.edu.np": {
    id: "staff-13",
    full_name: "Pravin Gautam",
    email: "pravin.gautam@aecs.edu.np",
    role: "MARKETING",
    job_title: "Digital Marketing & Intake Lead",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9851000013",
    department: "Marketing & Lead Acquisition",
    avatarBg: "#06B6D4",
  },

  // 14. Visa Lodgement & VFS Liaison
  "sarita.tamang@aecs.edu.np": {
    id: "staff-14",
    full_name: "Sarita Tamang",
    email: "sarita.tamang@aecs.edu.np",
    role: "VISA_OFFICER",
    job_title: "Visa Lodgement & VFS Liaison",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9860220014",
    department: "Visa & Compliance Desk",
    avatarBg: "#A855F7",
  },

  // 15. Japanese Language Faculty (JLPT/NAT)
  "milan.gurung@aecs.edu.np": {
    id: "staff-15",
    full_name: "Milan Gurung",
    email: "milan.gurung@aecs.edu.np",
    role: "FACULTY",
    job_title: "Japanese Language Faculty (JLPT/NAT)",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9803330015",
    department: "Test Preparation & Language Lab",
    avatarBg: "#F43F5E",
  },

  // 16. Student Welfare & NOC Liaison
  "puja.basnet@aecs.edu.np": {
    id: "staff-16",
    full_name: "Puja Basnet",
    email: "puja.basnet@aecs.edu.np",
    role: "FRONT_DESK",
    job_title: "Student Welfare & NOC Liaison",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9841440016",
    department: "Front Desk & Intake",
    avatarBg: "#3B82F6",
  },

  // 17. IT Infrastructure & CRM Systems
  "roshan.b@aecs.edu.np": {
    id: "staff-17",
    full_name: "Roshan Bajracharya",
    email: "roshan.b@aecs.edu.np",
    role: "IT_ADMIN",
    job_title: "IT Infrastructure & CRM Systems",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9851770017",
    department: "IT & Operations",
    avatarBg: "#475569",
  },

  // 18. Korean Language Faculty (TOPIK)
  "aayushree.m@aecs.edu.np": {
    id: "staff-18",
    full_name: "Aayushree Malla",
    email: "aayushree.m@aecs.edu.np",
    role: "FACULTY",
    job_title: "Korean Language Faculty (TOPIK)",
    is_active: true,
    branch: "Kathmandu Central Hub",
    phone: "+977 9860880018",
    department: "Test Preparation & Language Lab",
    avatarBg: "#0D9488",
  },
};

interface AuthContextValue {
  session: Session | { user: { id: string; email: string } } | null;
  profile: StaffProfile | null;
  permissions: RolePermissions;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoProfile: (emailKey: string) => void;
  updateProfile: (updates: Partial<StaffProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | { user: { id: string; email: string } } | null>(() => {
    const saved = localStorage.getItem("aecs_staff_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [profile, setProfile] = useState<StaffProfile | null>(() => {
    const saved = localStorage.getItem("aecs_staff_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession(newSession);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !isSupabaseConfigured || !("access_token" in session)) {
      return;
    }

    supabase
      .from("staff_profiles")
      .select("id,full_name,email,role,is_active")
      .eq("id", (session as Session).user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as StaffProfile);
      });
  }, [session]);

  const permissions = useMemo(() => {
    const role = profile?.role || "ADMIN";
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.ADMIN;
  }, [profile]);

  const value = useMemo(
    () => ({
      session,
      profile,
      permissions,
      loading,
      signIn: async (email: string, password: string) => {
        const normalized = email.trim().toLowerCase();

        const VALID_PASSWORDS = [
          "aecs2026",
          "admin123",
          "counsellor123",
          "counsellor2026",
          "visa123",
          "faculty123",
          "accounts123",
          "frontdesk123",
          "staff2026",
          "password123",
        ];

        const matchedProfile = DEMO_PROFILES[normalized];

        if (matchedProfile || VALID_PASSWORDS.includes(password.trim())) {
          const staffObj: StaffProfile = matchedProfile || {
            id: `staff-${Date.now()}`,
            full_name: normalized.split("@")[0].replace(".", " ").replace("_", " ").toUpperCase(),
            email: normalized,
            role: normalized.includes("admin") ? "ADMIN" : normalized.includes("counsel") ? "COUNSELLOR" : normalized.includes("visa") ? "VISA_OFFICER" : normalized.includes("account") ? "ACCOUNTANT" : "COUNSELLOR",
            job_title: "Authorized Staff Member",
            is_active: true,
            branch: "Kathmandu Central Hub",
            department: "General Operations",
          };

          const mockSession = { user: { id: staffObj.id, email: staffObj.email } };

          setSession(mockSession);
          setProfile(staffObj);
          localStorage.setItem("aecs_staff_session", JSON.stringify(mockSession));
          localStorage.setItem("aecs_staff_profile", JSON.stringify(staffObj));
          return;
        }

        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.session) {
              setSession(data.session);
            }
            return;
          } catch (err: any) {
            throw new Error(err.message || "Invalid staff email or password");
          }
        }

        throw new Error("Invalid staff credentials. Please check your official email and password.");
      },
      signOut: async () => {
        localStorage.removeItem("aecs_staff_session");
        localStorage.removeItem("aecs_staff_profile");
        setSession(null);
        setProfile(null);
        if (isSupabaseConfigured) {
          try {
            await supabase.auth.signOut();
          } catch {}
        }
      },
      switchDemoProfile: (emailKey: string) => {
        const staffObj = DEMO_PROFILES[emailKey] || DEMO_PROFILES["admin@abroad.edu.np"];
        const mockSession = { user: { id: staffObj.id, email: staffObj.email } };
        setSession(mockSession);
        setProfile(staffObj);
        localStorage.setItem("aecs_staff_session", JSON.stringify(mockSession));
        localStorage.setItem("aecs_staff_profile", JSON.stringify(staffObj));
      },
      updateProfile: (updates: Partial<StaffProfile>) => {
        if (!profile) return;
        const updated = { ...profile, ...updates };
        setProfile(updated);
        localStorage.setItem("aecs_staff_profile", JSON.stringify(updated));
      },
    }),
    [session, profile, permissions, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
}
