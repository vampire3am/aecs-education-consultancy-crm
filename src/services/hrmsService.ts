import { supabase } from "../lib/supabase";

const dateLabel=(value:string)=>new Date(`${value}T00:00:00`).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const nepalTime=(value:string|null)=>value?new Date(value).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Kathmandu"}):null;
const workedHours=(clockIn:string|null,clockOut:string|null)=>{if(!clockIn)return"—";const end=clockOut?new Date(clockOut):new Date();const minutes=Math.max(0,Math.floor((end.getTime()-new Date(clockIn).getTime())/60000));return`${Math.floor(minutes/60)}h ${minutes%60}m${clockOut?"":" active"}`};

export const HrmsService={
 async getMyTodayAttendance(){
  const{data,error}=await supabase.rpc("hr_my_attendance_status");
  if(error)throw error;
  if(!data)return null;
  const row=data as{employee_code:string;full_name:string;clock_in:string|null;clock_out:string|null;status:string;late_minutes:number};
  return{employeeCode:row.employee_code,fullName:row.full_name,clockIn:row.clock_in,clockOut:row.clock_out,status:row.status,lateMinutes:row.late_minutes};
 },
 async getStaff(){const{data,error}=await supabase.from("hr_employees").select("*").order("full_name");if(error)throw error;return(data??[]).map(e=>({id:e.id,empCode:e.employee_code,fullName:e.full_name,role:e.job_title,department:e.department,branch:e.branch,email:e.email,phone:e.phone??"",joinDate:dateLabel(e.join_date),baseSalary:Number(e.base_salary),status:e.employment_status,bankAccount:e.bank_account??"",panNumber:e.pan_number??""}))},
 async getAttendance(){const{data,error}=await supabase.from("hr_attendance").select("*,hr_employees(employee_code,full_name)").order("attendance_date",{ascending:false});if(error)throw error;return(data??[]).map(a=>({id:a.id,employeeId:a.employee_id,empCode:a.hr_employees?.employee_code??"—",fullName:a.hr_employees?.full_name??"Unknown",attendanceDate:a.attendance_date,date:dateLabel(a.attendance_date),checkIn:nepalTime(a.clock_in)??"—",checkOut:nepalTime(a.clock_out)??"In Office",workedHours:workedHours(a.clock_in,a.clock_out),status:a.status,lateMinutes:a.late_minutes}))},
 async getLeaves(){const{data,error}=await supabase.from("hr_leave_requests").select("*,hr_employees(employee_code,full_name),staff_profiles!hr_leave_requests_approved_by_fkey(full_name)").order("created_at",{ascending:false});if(error)throw error;return(data??[]).map(l=>({id:l.id,empCode:l.hr_employees?.employee_code??"—",fullName:l.hr_employees?.full_name??"Unknown",leaveType:l.leave_type,fromDate:l.from_date,toDate:l.to_date,days:Number(l.days),reason:l.reason,status:l.status,approvedBy:l.staff_profiles?.full_name}))},
 async getPayroll(){const{data,error}=await supabase.from("hr_payroll_items").select("*,hr_payroll_runs(period_start,period_end,status,paid_at),hr_employees(employee_code,full_name,job_title)");if(error)throw error;return(data??[]).map(p=>({id:p.id,empCode:p.hr_employees?.employee_code??"—",fullName:p.hr_employees?.full_name??"Unknown",role:p.hr_employees?.job_title??"",month:`${p.hr_payroll_runs?.period_start} – ${p.hr_payroll_runs?.period_end}`,basicSalary:Number(p.basic_salary),allowance:Number(p.allowance),commission:Number(p.commission),grossSalary:Number(p.gross_salary),ssfDeduction:Number(p.ssf_deduction),citDeduction:Number(p.cit_deduction),tdsTax:Number(p.tds_tax),netSalary:Number(p.net_salary),status:p.hr_payroll_runs?.status==="PAID"?"PAID":"PROCESSING",paymentDate:p.hr_payroll_runs?.paid_at?dateLabel(p.hr_payroll_runs.paid_at.slice(0,10)):"Pending"}))},
 async createEmployee(payload:Record<string,unknown>){const{error}=await supabase.rpc("hr_create_employee",{payload});if(error)throw error},
 async clockIn(){const{error}=await supabase.rpc("hr_clock_in");if(error)throw error},
 async clockOut(){const{error}=await supabase.rpc("hr_clock_out");if(error)throw error},
 async requestLeave(payload:Record<string,unknown>){const{error}=await supabase.rpc("hr_request_leave",{payload});if(error)throw error},
 async decideLeave(id:string,decision:"APPROVED"|"REJECTED"){const{error}=await supabase.rpc("hr_decide_leave",{leave_uuid:id,decision,decision_note:null});if(error)throw error},
};
