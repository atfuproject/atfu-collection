import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { designEnquiryText, generalEnquiryText, waLink } from "@/lib/whatsapp";

const KENYA = /kenya|kisumu|nairobi|mombasa|nakuru|eldoret|kakamega|kisii|siaya|bungoma|busia|migori|homa bay|kericho|thika/i; // rough heuristic, location is free text
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Enquiries are not set up yet." }, { status: 503 });
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true, id: "x", waUrl: waLink() }); // honeypot: pretend success to bots

  const name = s(b.name, 120), location = s(b.location, 120), contact = s(b.contact, 40), message = s(b.message, 2000);
  if (!name || !location || !message || b.consent !== true)
    return NextResponse.json({ error: "Please enter your name, location and message, and accept the consent box." }, { status: 400 });

  // Design details come from the database, never from the browser.
  let design: any = null;
  if (typeof b.designSlug === "string") {
    const { data } = await admin.from("designs").select("id,slug,reference,name,collections(title)").eq("slug", b.designSlug).eq("status", "published").maybeSingle();
    design = data;
  }
  const origin = new URL(req.url).origin;
  const pageUrl = design ? `${origin}/designs/${design.slug}` : null;
  const category = design?.collections?.title ?? null;

  const { data, error } = await admin.from("enquiries").insert({
    design_id: design?.id ?? null, design_name: design?.name ?? null, design_reference: design?.reference ?? null,
    collection_title: category, page_url: pageUrl, full_name: name, location, is_kenya: KENYA.test(location),
    contact_number: contact || null, message, consent: true,
  }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "We couldn’t save your enquiry. Please try again." }, { status: 500 });

  await admin.from("analytics_events").insert({ type: "enquiry_submit", path: pageUrl ? `/designs/${design.slug}` : "/", design_id: design?.id ?? null });

  const text = design
    ? designEnquiryText({ name, location, designName: design.name, reference: design.reference, category: category ?? "", url: pageUrl!, message })
    : generalEnquiryText(name, location, message);
  return NextResponse.json({ ok: true, id: data.id, waUrl: waLink(text) });
}
