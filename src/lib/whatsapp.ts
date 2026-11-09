// Single source of truth for WhatsApp links. Number comes from settings/env, never hardcoded in components.
export const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254723094777").replace(/\D/g, "");

export interface DesignEnquiry {
  name: string; location: string;
  designName: string; reference: string; category: string; url: string;
  message?: string;
}

export function waLink(text?: string, number = WA_NUMBER) {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function designEnquiryText(e: DesignEnquiry) {
  return [
    "Hello ATFU COLLECTION,", "",
    `My name is ${e.name}.`, "",
    `I am interested in ${e.designName}, reference ${e.reference}, from your ${e.category} collection.`, "",
    `My location is ${e.location}.`, "",
    e.message ? `${e.message}\n` : "",
    "I would like to enquire about having this design made.", "",
    `Design page: ${e.url}`, "",
    "Thank you.",
  ].join("\n");
}

export function generalEnquiryText(name: string, location: string, message: string) {
  return `Hello ATFU COLLECTION,\n\nMy name is ${name}, based in ${location}.\n\n${message}\n\nThank you.`;
}
