import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpenCheck, CalendarDays, CheckCircle2, GraduationCap, UserPlus, Users, XCircle } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

type Datum={name:string;value:number};
type DailyDatum={dateKey:string;name:string;leads:number;classes:number};
type Stats={total:number;today:number;converted:number;closed:number;classTotal:number;enrolled:number;daily:DailyDatum[];countries:Datum[];classPreferences:Datum[]};
type StudentDashboardRecord={created_at:string;study_preferences?:{preferred_country?:string}|null};
type ClassDashboardRecord={created_at:string;class_type:string};
const colors=["#f45124","#175cd3","#ff8a63","#4f7ddd","#f59e0b","#465ca8","#fb7185","#38a3a5"];
const initial:Stats={total:0,today:0,converted:0,closed:0,classTotal:0,enrolled:0,daily:createDailySeries(),countries:[],classPreferences:[]};

export function ManagementDashboard(){
  const[stats,setStats]=useState<Stats>(initial);
  useEffect(()=>{if(!isSupabaseConfigured)return;const cutoff=new Date(Date.now()-32*86400000).toISOString();Promise.all([
    supabase.from("students").select("id",{count:"exact",head:true}),
    supabase.from("students").select("id",{count:"exact",head:true}).gte("created_at",todayStart()),
    supabase.from("students").select("id",{count:"exact",head:true}).eq("status","CONVERTED_TO_STUDENT"),
    supabase.from("students").select("id",{count:"exact",head:true}).eq("status","CLOSED_LEAD"),
    supabase.from("students").select("created_at,study_preferences(preferred_country)").order("created_at",{ascending:true}),
    supabase.from("class_enquiries").select("id",{count:"exact",head:true}),
    supabase.from("class_enquiries").select("id",{count:"exact",head:true}).eq("status","ENROLLED"),
    supabase.from("class_enquiries").select("created_at,class_type").order("created_at",{ascending:true}),
    supabase.from("students").select("created_at").gte("created_at",cutoff),
  ]).then(([total,today,converted,closed,studentRecords,classTotal,enrolled,classRecords,recentStudents])=>{
    const countries=new Map<string,number>(),classPreferences=new Map<string,number>();
    ((studentRecords.data||[])as unknown as StudentDashboardRecord[]).forEach(record=>{const country=record.study_preferences?.preferred_country||"Other";countries.set(country,(countries.get(country)||0)+1)});
    ((classRecords.data||[])as ClassDashboardRecord[]).forEach(record=>{const className=classLabel(record.class_type);classPreferences.set(className,(classPreferences.get(className)||0)+1)});
    const daily=createDailySeries(),byDate=new Map(daily.map(item=>[item.dateKey,item]));
    ((recentStudents.data||[])as Pick<StudentDashboardRecord,"created_at">[]).forEach(record=>{const item=byDate.get(dayKey(record.created_at));if(item)item.leads+=1});
    ((classRecords.data||[])as ClassDashboardRecord[]).forEach(record=>{const item=byDate.get(dayKey(record.created_at));if(item)item.classes+=1});
    setStats({total:total.count||0,today:today.count||0,converted:converted.count||0,closed:closed.count||0,classTotal:classTotal.count||0,enrolled:enrolled.count||0,daily,countries:sorted(countries),classPreferences:sorted(classPreferences)});
  })},[]);
  const cards=[["Counselling leads",stats.total,Users,"blue"],["Today's registrations",stats.today,UserPlus,"amber"],["Converted to student",stats.converted,CheckCircle2,"green"],["Class enquiries",stats.classTotal,BookOpenCheck,"violet"],["Class enrolments",stats.enrolled,GraduationCap,"green"],["Closed leads",stats.closed,XCircle,"violet"]]as const;
  const monthLeads=stats.daily.reduce((sum,item)=>sum+item.leads,0),monthClasses=stats.daily.reduce((sum,item)=>sum+item.classes,0);
  return <><section className="page-heading"><div><p className="eyebrow">Management overview</p><h2>Lead & class performance</h2><p>Live daily activity and preference insights.</p></div><span className="date-pill"><CalendarDays size={15}/>Last 30 days</span></section>
    <section className="metric-grid">{cards.map(([label,value,Icon,tone])=><article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><p>Live database total</p></article>)}</section>
    <section className="panel monthly-performance"><div className="panel-head"><div><h3>30-day enquiry performance</h3><p>Daily counselling leads and class enquiries</p></div><div className="chart-summary"><span><i className="lead-dot"/>{monthLeads} leads</span><span><i className="class-dot"/>{monthClasses} classes</span></div></div><div className="monthly-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.daily} margin={{top:22,right:14,left:-12,bottom:4}} barGap={2} barCategoryGap="24%"><CartesianGrid stroke="#edf1f5" vertical={false}/><XAxis dataKey="name" axisLine={false} tickLine={false} interval={4} tick={{fontSize:10,fill:"#7b8798"}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#98a2b3"}}/><Tooltip cursor={{fill:"#f8fafc"}} content={<DailyTooltip/>}/><Legend iconType="circle" wrapperStyle={{fontSize:11,paddingTop:12}}/><Bar dataKey="leads" name="Counselling leads" fill="#f45124" radius={[5,5,0,0]} maxBarSize={15}/><Bar dataKey="classes" name="Class enquiries" fill="#175cd3" radius={[5,5,0,0]} maxBarSize={15}/></BarChart></ResponsiveContainer></div></section>
    <section className="preference-grid"><PreferenceChart title="Country preferences" subtitle="Share of preferred study destinations" data={stats.countries} empty="Country preferences will appear after registrations."/><PreferenceChart title="Class preferences" subtitle="Share of requested preparation classes" data={stats.classPreferences} empty="Class preferences will appear after class enquiries."/></section>
  </>;
}

function PreferenceChart({title,subtitle,data,empty}:{title:string;subtitle:string;data:Datum[];empty:string}){const total=data.reduce((sum,item)=>sum+item.value,0);return <article className="panel preference-card"><div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div><span className="preference-total">{total} total</span></div>{data.length?<div className="preference-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="#fff" strokeWidth={2}>{data.map((item,index)=><Cell key={item.name} fill={colors[index%colors.length]}/>)}</Pie><Tooltip contentStyle={{borderRadius:10,border:"1px solid #e6eaf0",boxShadow:"0 10px 30px #10182818",fontSize:11}}/><Legend iconType="circle" wrapperStyle={{fontSize:11,lineHeight:"22px"}}/></PieChart></ResponsiveContainer><div className="pie-center"><strong>{total}</strong><span>Total</span></div></div>:<div className="chart-empty">{empty}</div>}</article>}
function DailyTooltip({active,payload,label}:{active?:boolean;payload?:Array<{name:string;value:number;color:string}>;label?:string}){if(!active||!payload?.length)return null;return <div className="daily-tooltip"><strong>{label}</strong>{payload.map(item=><span key={item.name}><i style={{background:item.color}}/>{item.name}<b>{item.value}</b></span>)}</div>}
function createDailySeries(){const formatter=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"Asia/Kathmandu"});return Array.from({length:30},(_,index)=>{const date=new Date(Date.now()-(29-index)*86400000);return{dateKey:dayKey(date),name:formatter.format(date),leads:0,classes:0}})}
function dayKey(value:string|Date){const parts=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Asia/Kathmandu"}).formatToParts(new Date(value));const pick=(type:string)=>parts.find(part=>part.type===type)?.value||"";return`${pick("year")}-${pick("month")}-${pick("day")}`}
function todayStart(){const key=dayKey(new Date());return new Date(`${key}T00:00:00+05:45`).toISOString()}
function sorted(map:Map<string,number>){return[...map].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)}
function classLabel(value:string){return value==="DET"?"Duolingo (DET)":value==="GERMAN_LANGUAGE"?"German Language":value}
