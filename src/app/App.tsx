import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
const AppShell=lazy(()=>import("../components/layout/AppShell").then(module=>({default:module.AppShell})));
const LoginArea=lazy(()=>import("../features/auth/AuthRoutes").then(module=>({default:module.LoginArea})));
const ProtectedArea=lazy(()=>import("../features/auth/AuthRoutes").then(module=>({default:module.ProtectedArea})));
const PublicIntake=lazy(()=>import("../pages/PublicIntake").then(module=>({default:module.PublicIntake})));
const ManagementDashboard=lazy(()=>import("../features/dashboard/ManagementDashboard").then(module=>({default:module.ManagementDashboard})));
const RegistrationForm=lazy(()=>import("../features/students/registration/RegistrationForm").then(module=>({default:module.RegistrationForm})));
const StudentDirectory=lazy(()=>import("../features/students/directory/StudentDirectory").then(module=>({default:module.StudentDirectory})));
const StudentProfile=lazy(()=>import("../features/students/profile/StudentProfile").then(module=>({default:module.StudentProfile})));
const CounsellingDashboard=lazy(()=>import("../features/counselling/CounsellingDashboard").then(module=>({default:module.CounsellingDashboard})));
const AdminDashboard=lazy(()=>import("../features/admin/AdminDashboard").then(module=>({default:module.AdminDashboard})));
const ClassEnquiries=lazy(()=>import("../features/classes/ClassEnquiries").then(module=>({default:module.ClassEnquiries})));
const ClassEnquiryProfile=lazy(()=>import("../features/classes/ClassEnquiryProfile").then(module=>({default:module.ClassEnquiryProfile})));
const Loading=()=> <div className="route-loader"><span/><p>Loading…</p></div>;
export default function App(){return <Suspense fallback={<Loading/>}><Routes><Route path="/login" element={<LoginArea/>}/><Route path="/register" element={<PublicIntake/>}/><Route element={<ProtectedArea/>}><Route element={<AppShell/>}><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<ManagementDashboard/>}/><Route path="/students" element={<StudentDirectory/>}/><Route path="/students/new" element={<RegistrationForm/>}/><Route path="/students/:id" element={<StudentProfile/>}/><Route path="/class-enquiries" element={<ClassEnquiries/>}/><Route path="/class-enquiries/:id" element={<ClassEnquiryProfile/>}/><Route path="/counselling" element={<CounsellingDashboard/>}/><Route path="/settings" element={<AdminDashboard/>}/></Route></Route></Routes></Suspense>}
