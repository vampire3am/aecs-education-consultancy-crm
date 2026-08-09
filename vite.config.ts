import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({plugins:[react()],build:{target:"es2020",cssCodeSplit:true,rollupOptions:{output:{manualChunks(id){if(id.indexOf("recharts")>=0||id.indexOf("d3-")>=0)return"charts";if(id.indexOf("framer-motion")>=0)return"motion";if(id.indexOf("@supabase")>=0)return"supabase";if(id.indexOf("react")>=0||id.indexOf("scheduler")>=0)return"react-vendor"}}}}});
