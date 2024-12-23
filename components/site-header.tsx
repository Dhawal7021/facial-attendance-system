import Link from "next/link"
import { LogOut, Menu, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from '@/lib/supabase-client';

export function SiteHeader() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      alert('Failed to log out. Please try again.');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          Attendance System
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/dashboard/add-subject">Add Subject</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/class-management">Class Management</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/student-management">Student Management</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

