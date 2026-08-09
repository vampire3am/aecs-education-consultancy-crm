import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

export type StaffProfile={id:string;full_name:string;email:string;role:string;is_active:boolean};
type AuthContextValue={session:Session|null;profile:StaffProfile|null;loading:boolean;signIn:(email:string,password:string)=>Promise<void>;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){const[session,setSession]=useState<Session|null>(null);const[profile,setProfile]=useState<StaffProfile|null>(null);const[loading,setLoading]=useState(isSupabaseConfigured);
 useEffect(()=>{if(!isSupabaseConfigured){setLoading(false);return} supabase.auth.getSession().then(({data})=>setSession(data.session)).finally(()=>setLoading(false));const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);
 useEffect(()=>{if(!session){setProfile(null);return} supabase.from("staff_profiles").select("id,full_name,email,role,is_active").eq("id",session.user.id).single().then(({data})=>setProfile(data))},[session]);
 const value=useMemo(()=>({session,profile,loading,signIn:async(email:string,password:string)=>{const{error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error},signOut:async()=>{await supabase.auth.signOut()}}),[session,profile,loading]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error("useAuth must be inside AuthProvider");return c}
