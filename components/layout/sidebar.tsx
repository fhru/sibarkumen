'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems, NavItem } from '@/config/nav-items';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item, index) => (
        <SidebarItem
          key={index}
          item={item}
          isCollapsed={isCollapsed}
          pathname={pathname}
        />
      ))}
    </nav>
  );
}

function SidebarItem({
  item,
  isCollapsed,
  pathname,
}: {
  item: NavItem;
  isCollapsed?: boolean;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  const isGroup = !!item.items?.length;

  // Check if any child is active
  const isChildActive = item.items?.some((child) => child.href === pathname);
  const isActive = pathname === item.href || (isGroup && isChildActive);

  // Auto-expand if child is active
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  if (isGroup) {
    return (
      <div className="flex flex-col space-y-1">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-between group',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
            isCollapsed ? 'px-0 justify-center h-9' : 'px-3'
          )}
          onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                isActive ? 'text-sidebar-accent-foreground' : ''
              )}
            />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200 text-muted-foreground/50',
                isOpen && 'rotate-90'
              )}
            />
          )}
        </Button>
        {!isCollapsed && isOpen && (
          <div className="ml-4 flex flex-col space-y-1 border-l border-sidebar-border pl-2">
            {item.items?.map((child, idx) => (
              <Button
                key={idx}
                asChild
                variant="ghost"
                className={cn(
                  'w-full justify-start h-8 text-sm font-normal px-2',
                  pathname === child.href
                    ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-transparent'
                )}
              >
                <Link href={child.href}>
                  <span>{child.title}</span>
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
        'w-full justify-start',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
        isCollapsed ? 'px-0 justify-center h-9' : 'px-3'
      )}
      title={isCollapsed ? item.title : undefined}
    >
      <Link href={item.href}>
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-sidebar-accent-foreground' : ''
          )}
        />
        {!isCollapsed && <span className="ml-2">{item.title}</span>}
      </Link>
    </Button>
  );
}
