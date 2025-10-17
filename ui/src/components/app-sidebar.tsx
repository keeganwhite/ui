"use client";

import * as React from "react";
import {
  IconGift,
  IconDashboard,
  IconNetwork,
  IconWallet,
  IconUsers,
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

const getNavItems = (isSuperuser: boolean) => {
  const baseItems = [
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
  ];

  // Add Users menu item for superusers only
  if (isSuperuser) {
    baseItems.push({
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    });
  }

  baseItems.push({
    title: "Rewards",
    url: "/rewards",
    icon: IconGift,
  });

  return baseItems;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isSuperuser, setIsSuperuser] = React.useState(false);

  React.useEffect(() => {
    // Check if user is superuser from localStorage
    const superuserStatus = localStorage.getItem("is_superuser") === "true";
    setIsSuperuser(superuserStatus);
  }, []);

  const username = localStorage.getItem("auth_username");
  const user = {
    name: username || "Unknown",
    email: `${username}@example.com`,
    avatar: "/icons/profile-picture.png",
  };

  const navItems = getNavItems(isSuperuser);

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
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
