"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, NavItem, Role } from "@/config/nav-items";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const session = authClient.useSession();
  const userRole = session.data?.user.role as Role | undefined;

  const filteredNavItems = navItems
    .map((item) => {
      // Create a shallow copy of the item to avoid mutating the original
      const newItem = { ...item };

      // Check top level roles
      if (newItem.roles && !newItem.roles.includes(userRole || "petugas")) {
        return null;
      }

      // Filter sub items if they exist
      if (newItem.items) {
        newItem.items = newItem.items.filter((subItem) => {
          if (subItem.roles && !subItem.roles.includes(userRole || "petugas")) {
            return false;
          }
          return true;
        });

        // If all sub-items were filtered out, hide the group parent if it has no standalone href
        if (newItem.items.length === 0 && newItem.href === "#") {
          return null;
        }
      }

      return newItem;
    })
    .filter(Boolean) as NavItem[];

  return (
    <nav className="flex flex-col space-y-1.5">
      {filteredNavItems.map((item, index) => (
        <SidebarItem
          key={index}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function SidebarItem({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isGroup = !!item.items?.length;
  const isChildActive = item.items?.some((child) => child.href === pathname);
  const isActive = pathname === item.href || (isGroup && isChildActive);
  const [manualOpen, setManualOpen] = useState(false);
  const isOpen = isChildActive || manualOpen;

  if (isGroup) {
    return (
      <div className="flex flex-col space-y-1.5">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between group rounded-lg h-10",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
            "px-3",
          )}
          onClick={() => setManualOpen((value) => !value)}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-sidebar-accent-foreground" : "",
              )}
            />
            <span>{item.title}</span>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200 text-muted-foreground/50",
              isOpen && "rotate-90",
            )}
          />
        </Button>
        {isOpen && (
          <div className="ml-3 flex flex-col gap-1 border-l border-sidebar-border/80 pl-3">
            {item.items?.map((child, idx) => (
              <Button
                key={idx}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start h-9 text-sm font-normal px-2 rounded-md",
                  pathname === child.href
                    ? "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30",
                )}
              >
                <Link href={child.href} onClick={onNavigate}>
                  <span className="truncate">{child.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start rounded-lg h-10",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        "px-3",
      )}
    >
      <Link href={item.href} onClick={onNavigate}>
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-sidebar-accent-foreground" : "",
          )}
        />
        <span className="ml-2 truncate">{item.title}</span>
      </Link>
    </Button>
  );
}
