"use client";

import * as React from "react";
import {
  IconGift,
  IconDashboard,
  IconNetwork,
  IconWallet,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Wallet",
      url: "/wallet",
      icon: IconWallet,
    },
    {
      title: "Network",
      url: "#",
      icon: IconNetwork,
      items: [
        {
          title: "Internet Coupons",
          url: "/network/coupons",
        },
        {
          title: "Devices",
          url: "/network/devices",
        },
        {
          title: "Monitoring",
          url: "/network/monitoring",
        },
      ],
    },
    {
      title: "Rewards",
      url: "/rewards",
      icon: IconGift,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const username = localStorage.getItem("auth_username");
  const user = {
    name: username || "Unknown",
    email: `${username}@example.com`,
    avatar: "/icons/profile-picture.png",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-secondary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/logo.png" alt="Logo" width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">iNethi</span>
                  <span className="truncate text-xs">Network Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
