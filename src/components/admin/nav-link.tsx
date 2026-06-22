"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminNavLink({
  href,
  label,
  icon,
  exact,
  compact,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        compact ? "shrink-0 whitespace-nowrap" : "",
        active ? "bg-oni-red text-white" : "text-oni-ash hover:bg-oni-surface hover:text-oni-bone"
      )}
    >
      {icon} {label}
    </Link>
  );
}
