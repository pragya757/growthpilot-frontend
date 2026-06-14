"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",          label: "Mission Control", icon: "⚡" },
  { href: "/audience",  label: "Audience Builder", icon: "👥" },
  { href: "/campaigns", label: "Campaign Arena",   icon: "⚔️" },
  { href: "/analytics", label: "Analytics",        icon: "📊" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-bg-surface border-r border-border-dim flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border-dim">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
            <span className="text-xs">⚡</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-text-muted">
              GrowthPilot
            </p>
            <p className="text-[10px] text-text-muted/60 tracking-wider">AI Growth OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? path === "/"
              : path.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative",
                  active
                    ? "bg-accent-primary/10 text-text-primary border border-accent-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-base leading-none">{item.icon}</span>
                <span className={cn("font-medium", active && "text-text-primary")}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* AI Status */}
      <div className="px-4 py-4 border-t border-border-dim">
        <div className="glass rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-success live-dot" />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-text-muted">
              AI Active
            </span>
          </div>
          <p className="text-[11px] text-text-muted leading-tight">
            Scanning customer data for revenue opportunities
          </p>
        </div>
      </div>
    </aside>
  );
}
