import { supabase } from "../lib/supabase";

export interface DestinationDocumentRecord {
  id: string;
  destinationCode: string;
  destinationName: string;
  name: string;
  size: number;
  type: string;
  storagePath: string;
  status: "UNDER_REVIEW" | "VERIFIED" | "ACTION_REQUIRED" | "REJECTED" | "EXPIRED";
  uploadedAt: string;
  notes: string;
}

type DestinationDocumentRow = {
  id:string; destination_code:string; document_name:string; file_size:number; mime_type:string;
  storage_path:string; status:DestinationDocumentRecord["status"]; created_at:string; notes:string;
  study_destination_catalog?:{name:string}|null;
};

const mapRow = (row:DestinationDocumentRow):DestinationDocumentRecord => ({
  id: row.id,
  destinationCode: row.destination_code,
  destinationName: row.study_destination_catalog?.name ?? row.destination_code,
  name: row.document_name,
  size: row.file_size,
  type: row.mime_type,
  storagePath: row.storage_path,
  status: row.status,
  uploadedAt: row.created_at,
  notes: row.notes ?? "",
});

export const DestinationDocumentService = {
  async list(destinationCode?:string):Promise<DestinationDocumentRecord[]> {
    let query = supabase.from("destination_documents")
      .select("*,study_destination_catalog(name)").order("created_at", { ascending:false });
    if (destinationCode) query = query.eq("destination_code", destinationCode.toUpperCase());
    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as unknown as DestinationDocumentRow[]).map(mapRow);
  },
  async upload(destinationCode:string, file:File) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Your session has expired. Sign in again.");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/destinations/${destinationCode.toUpperCase()}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("student-documents").upload(path, file, { contentType:file.type, upsert:false });
    if (uploadError) throw uploadError;
    const { error } = await supabase.from("destination_documents").insert({
      destination_code:destinationCode.toUpperCase(), document_name:file.name, storage_path:path,
      file_size:file.size, mime_type:file.type || "application/octet-stream", uploaded_by:user.id,
    });
    if (error) {
      await supabase.storage.from("student-documents").remove([path]);
      throw error;
    }
  },
  async remove(record:DestinationDocumentRecord) {
    const { error } = await supabase.from("destination_documents").delete().eq("id", record.id);
    if (error) throw error;
    await supabase.storage.from("student-documents").remove([record.storagePath]);
  },
  async review(id:string, status:DestinationDocumentRecord["status"]) {
    const { error } = await supabase.from("destination_documents").update({ status, updated_at:new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async signedUrl(path:string, download=false) {
    const { data, error } = await supabase.storage.from("student-documents").createSignedUrl(path, 300, { download });
    if (error) throw error;
    return data.signedUrl;
  },
};
