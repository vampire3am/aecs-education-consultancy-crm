import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, BookOpenCheck, Check, ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, Sun, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthProvider";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard], ["Students", "/students", Users],
  ["Class Enquiries", "/class-enquiries", BookOpenCheck], ["Counselling", "/counselling", BookOpen], ["Settings", "/settings", Settings],
] as const;

const searchItems = [
  { label: "Dashboard", detail: "Workspace overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Students", detail: "Search and manage student records", to: "/students", icon: Users },
  { label: "Register student", detail: "Create a new student record", to: "/students/new", icon: UserPlus },
  { label: "Class Enquiries", detail: "Manage class and test preparation enquiries", to: "/class-enquiries", icon: BookOpenCheck },
  { label: "Counselling", detail: "Counselling records and follow-ups", to: "/counselling", icon: BookOpen },
  { label: "Settings", detail: "Staff accounts and permissions", to: "/settings", icon: Settings, adminOnly: true },
];

function Brand() {
  return <div className="brand"><span className="brand-logo-frame"><img src="/abroad-logo-new.png" alt="Abroad Education Consultancy Services"/></span><div><strong>Abroad Education Consultancy Services</strong><span>Choose Abroad to Study Abroad</span></div></div>;
}

function Sidebar({ close, canManageSettings }: { close?: () => void; canManageSettings: boolean }) {
  const visibleNav = nav.filter(([, to]) => to !== "/settings" || canManageSettings);
  return <aside className="sidebar"><Brand/><nav>{visibleNav.map(([label,to,Icon]) => <NavLink key={to} to={to} onClick={close} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="support"><span>Abroad Education Consultancy Services</span><p>Choose Abroad to Study Abroad</p></div></aside>;
}

export function AppShell() {
  const [open,setOpen] = useState(false);
  const [searchOpen,setSearchOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [notificationsOpen,setNotificationsOpen] = useState(false);
  const [profileOpen,setProfileOpen] = useState(false);
  const [hasUnread,setHasUnread] = useState(true);
  const [dark,setDark] = useState(() => localStorage.getItem("abroad-theme") === "dark");
  const searchInput = useRef<HTMLInputElement>(null);
  const location=useLocation();
  const navigate=useNavigate();
  const {profile,signOut}=useAuth();
  const canManageSettings = ["ADMIN", "DIRECTOR"].includes(profile?.role || "");
  const title=nav.find(([,path])=>path===location.pathname)?.[0] ?? (location.pathname==="/students/new" ? "New student" : "Workspace");
  const results = useMemo(() => searchItems.filter(item => (!item.adminOnly || canManageSettings) && `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase())), [query,canManageSettings]);

  useEffect(()=>setOpen(false),[location.pathname]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("abroad-theme",dark?"dark":"light")},[dark]);
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setSearchOpen(true)}if(event.key==="Escape"){setSearchOpen(false);setNotificationsOpen(false);setProfileOpen(false)}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[]);
  useEffect(()=>{if(searchOpen)setTimeout(()=>searchInput.current?.focus(),50)},[searchOpen]);
  function go(to:string){setSearchOpen(false);setQuery("");navigate(to)}

  return <div className="app-shell">
    <div className="desktop-sidebar"><Sidebar canManageSettings={canManageSettings}/></div>
    <AnimatePresence>{open && <><motion.button aria-label="Close navigation" className="drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setOpen(false)}/><motion.div className="drawer" initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{duration:.2}}><button className="drawer-close" onClick={()=>setOpen(false)}><X size={20}/></button><Sidebar close={()=>setOpen(false)} canManageSettings={canManageSettings}/></motion.div></>}</AnimatePresence>
    <main><header className="topbar"><div className="topbar-title"><button className="icon-button menu-button" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><div><span>Workspace</span><h1>{title}</h1></div></div><div className="top-actions">
      <button className="search" onClick={()=>setSearchOpen(true)} aria-label="Search workspace"><Search size={16}/><span>Search workspace</span><kbd>Ctrl K</kbd></button>
      <button className="icon-button" onClick={()=>setDark(value=>!value)} aria-label={dark?"Use light theme":"Use dark theme"} title={dark?"Light theme":"Dark theme"}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
      <div className="top-popover-wrap"><button className="icon-button notification" onClick={()=>{setNotificationsOpen(value=>!value);setProfileOpen(false);setHasUnread(false)}} aria-label="Notifications" aria-expanded={notificationsOpen}><Bell size={18}/>{hasUnread&&<i/>}</button>{notificationsOpen&&<div className="top-popover notifications-popover"><div className="popover-title"><strong>Notifications</strong><span>Today</span></div><div className="notification-item"><Check size={16}/><div><strong>You’re all caught up</strong><p>No new student updates require your attention.</p></div></div></div>}</div>
      <div className="top-popover-wrap"><button className="user" onClick={()=>{setProfileOpen(value=>!value);setNotificationsOpen(false)}} aria-expanded={profileOpen}><span>{profile?.full_name?.split(" ").map(x=>x[0]).slice(0,2).join("")||"AS"}</span><div><strong>{profile?.full_name||"Consultancy Staff"}</strong><small>{profile?.role?.replaceAll("_"," ")||"Local preview"}</small></div><ChevronDown size={15}/></button>{profileOpen&&<div className="top-popover profile-popover"><div className="profile-summary"><strong>{profile?.full_name||"Consultancy Staff"}</strong><span>{profile?.email||"Local preview"}</span></div>{canManageSettings&&<button onClick={()=>{setProfileOpen(false);navigate("/settings")}}><Settings size={16}/>Settings</button>}<button className="sign-out" onClick={()=>signOut()}><LogOut size={16}/>Sign out</button></div>}</div>
    </div></header>
      <motion.div className="page" key={location.pathname} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.25}}><Outlet/></motion.div>
    </main>
    <AnimatePresence>{searchOpen&&<motion.div className="command-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={()=>setSearchOpen(false)}><motion.section className="command-palette" initial={{opacity:0,y:-12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:.98}} onMouseDown={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search workspace"><div className="command-input"><Search size={19}/><input ref={searchInput} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search pages and actions…"/><button onClick={()=>setSearchOpen(false)} aria-label="Close search"><X size={18}/></button></div><div className="command-results">{results.map(({label,detail,to,icon:Icon})=><button key={to} onClick={()=>go(to)}><span><Icon size={18}/></span><div><strong>{label}</strong><small>{detail}</small></div></button>)}{results.length===0&&<p className="no-results">No matching pages found.</p>}</div><footer>Press Esc to close</footer></motion.section></motion.div>}</AnimatePresence>
  </div>;
}
