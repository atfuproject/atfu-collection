import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// Records that the visitor pressed "Continue to WhatsApp". This is NOT proof a message was sent, and never a sale.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const admin = adminClient();
  if (!admin || !/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ ok: false }, { status: 400 });
  const { data } = await admin.from("enquiries").update({ whatsapp_handoff_at: new Date().toISOString() }).eq("id", params.id).is("whatsapp_handoff_at", null).select("design_id").maybeSingle();
  if (data) await admin.from("analytics_events").insert({ type: "whatsapp_handoff", design_id: data.design_id });
  return NextResponse.json({ ok: true });
}
