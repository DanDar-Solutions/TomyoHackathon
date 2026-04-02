"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/services/auth.service";
import { toast } from "sonner";

export function ProfileButton({ initials, email }: { initials: string, email: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    toast.loading("Logging out...");
    await signOut();
    toast.dismiss();
    toast.success("Logged out successfully");
    router.push("/auth/login");
    router.refresh(); // Crucial to update the layout rendering
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-primary rounded-full">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold tracking-wider hover:bg-primary/20 hover:scale-105 transition-all shadow-sm">
          {initials}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">My Profile</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 transition-colors">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
