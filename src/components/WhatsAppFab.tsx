import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
export function WhatsAppFab() {
  return (
    <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with ATFU COLLECTION on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-bg shadow-lg transition hover:scale-105">
      <MessageCircle size={24} />
    </a>
  );
}
