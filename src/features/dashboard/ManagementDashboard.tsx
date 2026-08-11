import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpenCheck, CalendarDays, CheckCircle2, GraduationCap, UserPlus, Users, XCircle } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

type Datum = { name: string; value: number };
type Stats = { total:number; today:number; converted:number; closed:number; classTotal:number; enrolled:number; trend:Datum[]; countries:Datum[] };
type StudentDashboardRecord = { created_at:string; study_preferences?:{preferred_country?:string}|null };
const pieColors = ["#f45124","#465ca8","#f59e0b","#2563eb","#14b8a6","#8b5cf6","#ec4899"];
const barColors = ["#f45124","#ff7043","#465ca8","#6374bd","#14a38b","#e9a23b","#7c5ce7","#d84f8b"];

export function ManagementDashboard() {
  const [stats,setStats] = useState<Stats>({total:0,today:0,converted:0,closed:0,classTotal:0,enrolled:0,trend:[],countries:[]});
  useEffect(() => { if (!isSupabaseConfigured) return; Promise.all([
    supabase.from("students").select("id",{count:"exact",head:true}),
    supabase.from("students").select("id",{count:"exact",head:true}).gte("created_at",new Date().toISOString().slice(0,10)),
    supabase.from("students").select("id",{count:"exact",head:true}).eq("status","CONVERTED_TO_STUDENT"),
    supabase.from("students").select("id",{count:"exact",head:true}).eq("status","CLOSED_LEAD"),
    supabase.from("students").select("created_at,study_preferences(preferred_country)").order("created_at",{ascending:true}),
    supabase.from("class_enquiries").select("id",{count:"exact",head:true}),
    supabase.from("class_enquiries").select("id",{count:"exact",head:true}).eq("status","ENROLLED")
  ]).then(([total,today,converted,closed,records,classTotal,enrolled]) => {
    const months = new Map<string,number>(); const countries = new Map<string,number>();
    ((records.data || []) as unknown as StudentDashboardRecord[]).forEach(record => { const key = new Date(record.created_at).toLocaleDateString("en",{month:"short",year:"2-digit"}); months.set(key,(months.get(key)||0)+1); const country=record.study_preferences?.preferred_country||"Other"; countries.set(country,(countries.get(country)||0)+1); });
    setStats({total:total.count||0,today:today.count||0,converted:converted.count||0,closed:closed.count||0,classTotal:classTotal.count||0,enrolled:enrolled.count||0,trend:[...months].map(([name,value])=>({name,value})).slice(-8),countries:[...countries].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)});
  }); },[]);
  const cards = [["Counselling leads",stats.total,Users,"blue"],["Today's registrations",stats.today,UserPlus,"amber"],["Converted to student",stats.converted,CheckCircle2,"green"],["Class enquiries",stats.classTotal,BookOpenCheck,"violet"],["Class enrolments",stats.enrolled,GraduationCap,"green"],["Closed leads",stats.closed,XCircle,"violet"]] as const;
  return <><section className="page-heading"><div><p className="eyebrow">Management overview</p><h2>Lead performance</h2><p>Live registration and conversion insights.</p></div><span className="date-pill"><CalendarDays size={15}/>Updated now</span></section>
    <section className="metric-grid">{cards.map(([label,value,Icon,tone])=><article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><p>Live database total</p></article>)}</section>
    <section className="dashboard-grid charts"><article className="panel"><div className="panel-head"><div><h3>Destination performance</h3><p>Leads by preferred study country</p></div><span className="chart-total">{stats.countries.reduce((sum,item)=>sum+item.value,0)} leads</span></div><div className="country-bar-scroll"><div className="country-bar-chart" style={{height:Math.max(280,stats.countries.length*46)}}><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.countries} layout="vertical" margin={{top:12,right:38,left:16,bottom:4}} barCategoryGap="28%"><CartesianGrid stroke="#eef1f4" horizontal={false} strokeDasharray="3 4"/><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#98a2b3"}}/><YAxis type="category" dataKey="name" width={92} axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#475467"}}/><Tooltip cursor={{fill:"#f8fafc"}} contentStyle={{borderRadius:10,border:"1px solid #e6eaf0",boxShadow:"0 10px 30px #10182818"}}/><Bar dataKey="value" name="Leads" radius={[0,8,8,0]} maxBarSize={25}>{stats.countries.map((item,index)=><Cell key={item.name} fill={barColors[index%barColors.length]}/>) }<LabelList dataKey="value" position="right" style={{fontSize:10,fontWeight:700,fill:"#475467"}}/></Bar></BarChart></ResponsiveContainer></div>{stats.countries.length===0&&<div className="chart-empty">Country data will appear after registrations.</div>}</div></article>
    <article className="panel"><div className="panel-head"><div><h3>Country preferences</h3><p>Share of preferred destinations</p></div></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.countries} dataKey="value" nameKey="name" innerRadius={50} outerRadius={86} paddingAngle={2}>{stats.countries.map((item,index)=><Cell key={item.name} fill={pieColors[index%pieColors.length]}/>)}</Pie><Tooltip/><Legend iconType="circle" wrapperStyle={{fontSize:11}}/></PieChart></ResponsiveContainer></div></article></section></>;
}
