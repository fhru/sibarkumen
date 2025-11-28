'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
    const pathname = usePathname();
    // Simple breadcrumb logic: split path by '/' and map
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Sibarkumen</BreadcrumbLink>
                </BreadcrumbItem>
                {paths.map((path, index) => {
                    const isLast = index === paths.length - 1;
                    const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
                    return (
                        <React.Fragment key={path}>
                             <BreadcrumbSeparator className="hidden md:block" />
                             <BreadcrumbItem>
                                {isLast ? (
                                     <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={`/${paths.slice(0, index + 1).join('/')}`}>
                                        {formattedPath}
                                    </BreadcrumbLink>
                                )}
                             </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
    );
}
