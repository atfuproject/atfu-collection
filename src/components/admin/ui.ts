export const field = "w-full border border-fg/25 bg-transparent px-3 py-3 text-base outline-none focus:border-gold";
export const btn = "bg-gold px-5 py-3 text-sm font-medium text-bg hover:brightness-110 disabled:opacity-50";
export const btn2 = "border border-fg/30 px-4 py-3 text-sm hover:border-gold hover:text-gold disabled:opacity-50";
export const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "");
