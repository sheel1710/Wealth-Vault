import { Link, useLocation } from "wouter";
import { Home, Files, PlusCircle, BarChart2, Settings } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-3 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/fd-records">
          <a className={`flex flex-col items-center py-3 ${isActive('/fd-records') ? 'text-primary' : 'text-gray-500'}`}>
            <Files className="h-6 w-6" />
            <span className="text-xs mt-1">FDs</span>
          </a>
        </Link>
        
        <button className="flex flex-col items-center py-3 text-gray-500 relative">
          <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center -mt-5 text-white shadow-lg">
            <PlusCircle className="h-6 w-6" />
          </div>
        </button>
        
        <Link href="/income-expense">
          <a className={`flex flex-col items-center py-3 ${isActive('/income-expense') ? 'text-primary' : 'text-gray-500'}`}>
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Income</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={`flex flex-col items-center py-3 ${isActive('/settings') ? 'text-primary' : 'text-gray-500'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
