'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Truck,
  Users,
  Archive,
  CreditCard,
  ShieldCheck,
  User,
  LogOut
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { UserNav } from './user-nav';

export function AppSidebar({ user, ...props }) {
  const pathname = usePathname();
  // Removed isAdmin check - everyone gets full access per new PRD
  // const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'Barang',
      url: '#',
      icon: Box,
      isActive: pathname.startsWith('/dashboard/barang') || pathname.startsWith('/dashboard/bast') || pathname.startsWith('/dashboard/kategori'),
      items: [
        { title: 'Daftar Barang', url: '/dashboard/barang' },
        { title: 'Kategori Barang', url: '/dashboard/kategori' },
        { title: 'BAST Masuk', url: '/dashboard/bast-masuk' },
        { title: 'BAST Keluar', url: '/dashboard/bast-keluar' },
      ],
    },
    {
      title: 'Permintaan & Penyaluran',
      url: '#',
      icon: Truck,
      isActive: pathname.startsWith('/dashboard/sp'),
      items: [
        { title: 'Permintaan (SPB)', url: '/dashboard/spb' },
        { title: 'Penyaluran (SPPB)', url: '/dashboard/sppb' },
      ],
    },
    {
      title: 'Kepegawaian',
      url: '#',
      icon: Users,
      isActive: pathname.startsWith('/dashboard/pegawai') || pathname.startsWith('/dashboard/pejabat'),
      items: [
        { title: 'Daftar Pegawai', url: '/dashboard/pegawai' },
        { title: 'Pejabat Pengelola', url: '/dashboard/pejabat' },
      ],
    },
    {
      title: 'Rekening',
      url: '/dashboard/rekening',
      icon: CreditCard,
      isActive: pathname === '/dashboard/rekening',
    },
    {
      title: 'Arsip Dokumen',
      url: '/dashboard/arsip',
      icon: Archive,
      isActive: pathname === '/dashboard/arsip',
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Box className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">SibarKumen</span>
            <span className="truncate text-xs">v2.0 Enterprise</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <React.Fragment key={item.title}>
                  {item.items ? (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <div className="p-2">
            <UserNav user={user} />
         </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
