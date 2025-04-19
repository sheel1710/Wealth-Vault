import { useAuth } from "@/hooks/use-auth";
import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title = "Dashboard" }: TopNavProps) {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    
    const names = user.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button className="text-gray-500 focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-4 text-lg font-semibold text-primary md:hidden">FD Manager</span>
        </div>
        
        <div className="hidden md:flex items-center">
          <h1 className="text-xl font-semibold text-text-dark">{title}</h1>
        </div>
        
        <div className="flex items-center">
          <button className="p-1 mr-3 text-gray-500 hover:text-primary focus:outline-none relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    {getUserInitials()}
                  </div>
                  <span className="ml-2 text-sm font-medium text-text-dark hidden md:block">
                    {user?.name || 'User'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu (could be expanded in the future) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          {/* Mobile menu items would go here */}
        </div>
      )}
    </header>
  );
}
