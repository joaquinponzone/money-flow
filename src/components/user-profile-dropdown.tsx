"use client";

import { User } from "@supabase/supabase-js";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "./sign-out";
import { Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface UserProfileDropdownProps {
  user: User | null;
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  if (!user) return null;
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return "U";
    const parts = user.email.split('@')[0].split(/[.-_]/);
    return parts.map(part => part[0]?.toUpperCase() || '').join('').slice(0, 2);
  };

  // Get profile picture URL from user metadata (if available from Google auth)
  const profilePicture = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="size-9 border border-primary/10 hover:border-primary/20 transition-colors">
          {profilePicture ? (
            <AvatarImage src={profilePicture} alt={user.email || "User"} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-sm font-black text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-sm text-primary font-medium">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <UserIcon className="size-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 