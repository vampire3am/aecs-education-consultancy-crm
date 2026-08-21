import { supabase } from "../lib/supabase";

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: "Management" | "Counselling" | "Visa & Compliance" | "Test Preparation" | "Finance & Accounts" | "Front Desk & Intake" | "B2B & Marketing" | "IT & Operations";
  presence: "ONLINE" | "IN_MEETING" | "BUSY" | "AWAY" | "OFFLINE";
  avatarBg: string;
  phone?: string;
  bio?: string;
}

export interface ChatAttachment {
  name: string;
  size: string;
  type: "pdf" | "image" | "doc" | "archive";
  url?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatarBg: string;
  channelId?: string;
  recipientId?: string;
  content: string;
  timestamp: string;
  taggedStudentCode?: string;
  taggedStudentName?: string;
  attachments?: ChatAttachment[];
  reactions?: MessageReaction[];
  isPinned?: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  topic: string;
  category: "Department" | "Broadcast" | "Admissions";
  iconName: string;
  isPrivate?: boolean;
  memberCount: number;
  unreadCount?: number;
}

// 18 Registered Staff Members of AECS
const LEGACY_DEMO_STAFF: StaffUser[] = [
  {
    id: "staff-1",
    fullName: "AECS Administrator",
    email: "admin@abroad.edu.np",
    role: "Managing Director & Operations Head",
    department: "Management",
    presence: "ONLINE",
    avatarBg: "#2563EB",
    phone: "+977 9851000001",
    bio: "Executive Operations & Institutional Oversight.",
  },
  {
    id: "staff-2",
    fullName: "Sita Adhikari",
    email: "counsellor@abroad.edu.np",
    role: "Senior Head Counsellor · UK & Europe",
    department: "Counselling",
    presence: "ONLINE",
    avatarBg: "#8B5CF6",
    phone: "+977 9841230002",
    bio: "British Council certified lead counsellor. Expert in UK Russell Group & Ireland university placements.",
  },
  {
    id: "staff-3",
    fullName: "Binod Maharjan",
    email: "visa@abroad.edu.np",
    role: "Senior Visa & Compliance Officer",
    department: "Visa & Compliance",
    presence: "ONLINE",
    avatarBg: "#059669",
    phone: "+977 9801980003",
    bio: "Lead compliance specialist for Australia (subclass 500), Canada (IRCC), and German visa filings.",
  },
  {
    id: "staff-4",
    fullName: "Pradeep Joshi",
    email: "faculty@abroad.edu.np",
    role: "Senior Master Trainer · IELTS & PTE",
    department: "Test Preparation",
    presence: "ONLINE",
    avatarBg: "#D97706",
    phone: "+977 9812340004",
    bio: "12+ years master instructor. Cambridge IELTS examiner trained & Duolingo English Test specialist.",
  },
  {
    id: "staff-5",
    fullName: "Manisha Rai",
    email: "manisha.rai@aecs.edu.np",
    role: "Pearson Certified Trainer · PTE Academic",
    department: "Test Preparation",
    presence: "IN_MEETING",
    avatarBg: "#EC4899",
    phone: "+977 9851120005",
    bio: "Pearson PTE Academic certified specialist. Heading digital testing lab & speaking simulations.",
  },
  {
    id: "staff-6",
    fullName: "Sushil Sharma",
    email: "sushil.sharma@aecs.edu.np",
    role: "Faculty Lead · German Language (A1–B2)",
    department: "Test Preparation",
    presence: "ONLINE",
    avatarBg: "#10B981",
    phone: "+977 9860110006",
    bio: "Goethe-Institut certified faculty. Specialized in German university entrance requirements & APS.",
  },
  {
    id: "staff-7",
    fullName: "Ramesh Shrestha",
    email: "accounts@abroad.edu.np",
    role: "Chief Finance Officer & Accounts Lead",
    department: "Finance & Accounts",
    presence: "ONLINE",
    avatarBg: "#0284C7",
    phone: "+977 9803440007",
    bio: "Head of financial reporting, student invoice reconciliations, and overseas commission auditing.",
  },
  {
    id: "staff-8",
    fullName: "Sunita KC",
    email: "frontdesk@abroad.edu.np",
    role: "Front Desk & Lead Intake Coordinator",
    department: "Front Desk & Intake",
    presence: "ONLINE",
    avatarBg: "#F59E0B",
    phone: "+977 9841550008",
    bio: "Manages walk-in student registrations, tele-inquiries, and daily counsellor booking schedules.",
  },
  {
    id: "staff-9",
    fullName: "Bikram Thapa",
    email: "bikram.thapa@aecs.edu.np",
    role: "USA Admissions & SAT Specialist",
    department: "Counselling",
    presence: "BUSY",
    avatarBg: "#6366F1",
    phone: "+977 9851660009",
    bio: "Dedicated advisor for US Common App, I-20 documentation, and institutional scholarship scouting.",
  },
  {
    id: "staff-10",
    fullName: "Anjali Shrestha",
    email: "anjali.shrestha@aecs.edu.np",
    role: "Documentation & Notary Officer",
    department: "Visa & Compliance",
    presence: "ONLINE",
    avatarBg: "#14B8A6",
    phone: "+977 9860770010",
    bio: "Scrutiny and municipal verification of academic transcripts, property valuation, and relationship certificates.",
  },
  {
    id: "staff-11",
    fullName: "Deepak Poudel",
    email: "deepak.poudel@aecs.edu.np",
    role: "B2B Partner Relations Manager",
    department: "B2B & Marketing",
    presence: "AWAY",
    avatarBg: "#EA580C",
    phone: "+977 9801880011",
    bio: "Oversees regional education agency partnerships, institutional sub-agent agreements, and MOUs.",
  },
  {
    id: "staff-12",
    fullName: "Kavita Dahal",
    email: "kavita.dahal@aecs.edu.np",
    role: "Study Abroad Counsellor · Australia & NZ",
    department: "Counselling",
    presence: "ONLINE",
    avatarBg: "#84CC16",
    phone: "+977 9841990012",
    bio: "Specialist for Australian G8 universities, TAFE diplomas, and New Zealand university intakes.",
  },
  {
    id: "staff-13",
    fullName: "Pravin Gautam",
    email: "pravin.gautam@aecs.edu.np",
    role: "Digital Marketing & Intake Lead",
    department: "B2B & Marketing",
    presence: "ONLINE",
    avatarBg: "#06B6D4",
    phone: "+977 9851000013",
    bio: "Oversees digital intake campaigns, student seminar event promotions, and web inquiry pipelines.",
  },
  {
    id: "staff-14",
    fullName: "Sarita Tamang",
    email: "sarita.tamang@aecs.edu.np",
    role: "Visa Lodgement & VFS Liaison",
    department: "Visa & Compliance",
    presence: "IN_MEETING",
    avatarBg: "#A855F7",
    phone: "+977 9860220014",
    bio: "Coordinates VFS biometrics appointments, embassy interview preps, and pre-departure briefings.",
  },
  {
    id: "staff-15",
    fullName: "Milan Gurung",
    email: "milan.gurung@aecs.edu.np",
    role: "Japanese Language Faculty (JLPT/NAT)",
    department: "Test Preparation",
    presence: "ONLINE",
    avatarBg: "#F43F5E",
    phone: "+977 9803330015",
    bio: "N2 certified Japanese instructor. Guiding language school & vocational trainees for Japan intakes.",
  },
  {
    id: "staff-16",
    fullName: "Puja Basnet",
    email: "puja.basnet@aecs.edu.np",
    role: "Student Welfare & NOC Liaison",
    department: "Front Desk & Intake",
    presence: "ONLINE",
    avatarBg: "#3B82F6",
    phone: "+977 9841440016",
    bio: "Assists students with MOEST No Objection Certificate (NOC) processing and accommodation booking.",
  },
  {
    id: "staff-17",
    fullName: "Roshan Bajracharya",
    email: "roshan.b@aecs.edu.np",
    role: "IT Infrastructure & CRM Systems",
    department: "IT & Operations",
    presence: "ONLINE",
    avatarBg: "#475569",
    phone: "+977 9851770017",
    bio: "Administers AECS secure document vault, database backups, and internal network communications.",
  },
  {
    id: "staff-18",
    fullName: "Aayushree Malla",
    email: "aayushree.m@aecs.edu.np",
    role: "Korean Language Faculty (TOPIK)",
    department: "Test Preparation",
    presence: "AWAY",
    avatarBg: "#0D9488",
    phone: "+977 9860880018",
    bio: "TOPIK Level 5 instructor preparing candidates for South Korea bachelor & masters scholarship tracks.",
  },
];

// Compatibility export for calling components. Production staff must come
// exclusively from authenticated staff_profiles, never a fabricated roster.
export const AECS_STAFF_18: StaffUser[] = LEGACY_DEMO_STAFF.filter(() => false);

// Department Collaborative Channels
export const AECS_CHANNELS: ChatChannel[] = [
  {
    id: "ch-announcements",
    name: "general-announcements",
    description: "Office-wide announcements, policy updates, and executive briefings",
    topic: "📢 All 18 Staff Office Broadcast · Managed by Administration",
    category: "Broadcast",
    iconName: "Megaphone",
    memberCount: 18,
    unreadCount: 0,
  },
  {
    id: "ch-visa-compliance",
    name: "visa-compliance-desk",
    description: "Urgent visa submissions, biometrics slots, CAS/I-20 follow-ups, and embassy policy bulletins",
    topic: "🛂 Visa & Embassy Lodgement Coordination",
    category: "Department",
    iconName: "ShieldCheck",
    memberCount: 8,
    unreadCount: 0,
  },
  {
    id: "ch-counselling-admissions",
    name: "study-abroad-counsellors",
    description: "University application submissions, conditional offer tracking, and scholarship matching",
    topic: "🌍 Global Admissions & Direct University Applications",
    category: "Department",
    iconName: "Globe",
    memberCount: 10,
    unreadCount: 0,
  },
  {
    id: "ch-test-prep",
    name: "test-prep-faculty",
    description: "IELTS, PTE, Duolingo, German, Japanese, and Korean class batches & mock score logs",
    topic: "📖 Faculty Class Rosters & Diagnostic Test Scores",
    category: "Department",
    iconName: "BookOpen",
    memberCount: 7,
    unreadCount: 0,
  },
  {
    id: "ch-finance",
    name: "finance-accounts-desk",
    description: "Student tuition receipts, invoice generation, voucher auditing, and B2B commission reconciliations",
    topic: "💳 Accounting, eSewa/Bank Vouchers & Revenue Ledgers",
    category: "Department",
    iconName: "CreditCard",
    memberCount: 5,
    unreadCount: 0,
  },
  {
    id: "ch-front-desk",
    name: "front-desk-intake",
    description: "Walk-in inquiries, appointment scheduling, phone reception, and student welcome desk",
    topic: "🛎️ Daily Walk-in Lead Registrations & Consultations",
    category: "Department",
    iconName: "Users",
    memberCount: 9,
    unreadCount: 0,
  },
];

export const MessagingService = {
  getStaff: async ():Promise<StaffUser[]> => {const{data,error}=await supabase.from("staff_profiles").select("id,full_name,email,role,department,phone,avatar_bg").eq("is_active",true).order("full_name");if(error)throw error;return(data??[]).map(s=>({id:s.id,fullName:s.full_name,email:s.email,role:s.role,department:(s.department||"IT & Operations")as StaffUser["department"],presence:"OFFLINE",avatarBg:s.avatar_bg||"#2563EB",phone:s.phone??undefined}))},
  getChannels: async ():Promise<ChatChannel[]> => {const{data,error}=await supabase.from("communication_channels").select("id,name,description,category,is_private,communication_channel_members(count)").order("name");if(error)throw error;return(data??[]).map(c=>({id:c.id,name:c.name,description:c.description??"",topic:c.description??"",category:c.category==="BROADCAST"?"Broadcast":c.category==="CASE"?"Admissions":"Department",iconName:c.category==="BROADCAST"?"Megaphone":"Users",isPrivate:c.is_private,memberCount:c.communication_channel_members?.[0]?.count??0,unreadCount:0}))},
  getMessages: async (): Promise<ChatMessage[]> => {
    const{data,error}=await supabase.from("communication_messages").select("*,sender:staff_profiles!communication_messages_sender_id_fkey(full_name,role,avatar_bg),students(student_code,full_name),communication_reactions(emoji,staff_profiles(full_name))").order("created_at");if(error)throw error;return(data??[]).map(m=>{const grouped=new Map<string,string[]>();for(const r of m.communication_reactions??[]){grouped.set(r.emoji,[...(grouped.get(r.emoji)??[]),r.staff_profiles?.full_name??"Staff"])}return{id:m.id,senderId:m.sender_id,senderName:m.sender?.full_name??"Staff",senderRole:m.sender?.role??"Staff",senderAvatarBg:m.sender?.avatar_bg??"#2563EB",channelId:m.channel_id??undefined,recipientId:m.recipient_id??undefined,content:m.content,timestamp:new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),taggedStudentCode:m.students?.student_code,taggedStudentName:m.students?.full_name,attachments:m.attachments as ChatAttachment[],reactions:[...grouped].map(([emoji,users])=>({emoji,count:users.length,users})),isPinned:m.is_pinned}});
  },

  sendMessage: async (messagePayload: Omit<ChatMessage, "id" | "timestamp">): Promise<ChatMessage> => {
    const{data,error}=await supabase.rpc("send_internal_message",{payload:{recipient_id:messagePayload.recipientId??"",channel_id:messagePayload.channelId??"",content:messagePayload.content,attachments:messagePayload.attachments??[]}});if(error)throw error;const current=await MessagingService.getMessages();const created=current.find(m=>m.id===data);if(!created)throw new Error("Message was created but could not be reloaded");return created;
  },

  toggleReaction: async (messageId: string, emoji: string, currentUserName: string): Promise<ChatMessage[]> => {
    void currentUserName;const{error}=await supabase.rpc("toggle_message_reaction",{message_uuid:messageId,reaction_emoji:emoji});if(error)throw error;return MessagingService.getMessages();
  },

  togglePinMessage: async (messageId: string): Promise<ChatMessage[]> => {
    const{data:current,error:readError}=await supabase.from("communication_messages").select("is_pinned").eq("id",messageId).single();if(readError)throw readError;const{error}=await supabase.from("communication_messages").update({is_pinned:!current.is_pinned}).eq("id",messageId);if(error)throw error;return MessagingService.getMessages();
  },

  deleteMessage: async (messageId: string): Promise<ChatMessage[]> => {
    const{error}=await supabase.from("communication_messages").update({deleted_at:new Date().toISOString()}).eq("id",messageId);if(error)throw error;return MessagingService.getMessages();
  },

  subscribeToSyncEvents: (onUpdate: () => void) => {
    const channel=supabase.channel("crm-communications").on("postgres_changes",{event:"*",schema:"public",table:"communication_messages"},onUpdate).on("postgres_changes",{event:"*",schema:"public",table:"communication_reactions"},onUpdate).subscribe();return()=>{void supabase.removeChannel(channel)};
  },
};
