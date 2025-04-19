import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Files, 
  BarChart2, 
  TrendingUp, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function SidebarNav() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white shadow-md">
      <div className="p-4 flex items-center justify-center border-b border-gray-200">
        <span className="text-xl font-bold text-primary">FD Manager</span>
      </div>
      
      <nav className="flex flex-col p-4 overflow-y-auto h-full">
        <div className="space-y-2">
          <Link href="/">
            <a className={`flex items-center px-4 py-3 ${isActive('/') ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-dark hover:bg-gray-100'} rounded-md font-medium transition-colors`}>
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </a>
          </Link>
          
          <Link href="/fd-records">
            <a className={`flex items-center px-4 py-3 ${isActive('/fd-records') ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-dark hover:bg-gray-100'} rounded-md font-medium transition-colors`}>
              <Files className="h-5 w-5 mr-3" />
              FD Records
            </a>
          </Link>
          
          <Link href="/income-expense">
            <a className={`flex items-center px-4 py-3 ${isActive('/income-expense') ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-dark hover:bg-gray-100'} rounded-md font-medium transition-colors`}>
              <BarChart2 className="h-5 w-5 mr-3" />
              Income & Expenses
            </a>
          </Link>
          
          <Link href="/projections">
            <a className={`flex items-center px-4 py-3 ${isActive('/projections') ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-dark hover:bg-gray-100'} rounded-md font-medium transition-colors`}>
              <TrendingUp className="h-5 w-5 mr-3" />
              Projections
            </a>
          </Link>
          
          <Link href="/settings">
            <a className={`flex items-center px-4 py-3 ${isActive('/settings') ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-dark hover:bg-gray-100'} rounded-md font-medium transition-colors`}>
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </a>
          </Link>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-text-dark hover:bg-gray-100 rounded-md w-full text-left transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
