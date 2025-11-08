import { Home, TrendingUp, MessageCircle, Gamepad2, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { useState } from 'react';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userType?: 'parent' | 'child';
}

export function AppSidebar({ currentPage, onNavigate, userType = 'parent' }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Different menu items for parent vs child
  const parentMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'chatbot', label: 'Chatbot', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const childMenuItems = [
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'activities', label: 'Activities', icon: TrendingUp },
  ];

  const menuItems = userType === 'child' ? childMenuItems : parentMenuItems;

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-2xl">
          🌙
        </div>
        <div>
          <h2 className="text-white">Parvarish AI</h2>
          <p className="text-sm text-white/80">Smart Parenting</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-[#2D5F3F] shadow-lg'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Info */}
      <div className="mt-8 p-4 bg-white/10 rounded-xl text-white">
        <p className="text-sm">Logged in as</p>
        <p className="capitalize">{userType}</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-xl">
            🌙
          </div>
          <div>
            <h2 className="text-white text-lg">Parvarish AI</h2>
          </div>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-gradient-to-b from-[#A8E6CF] to-[#8BD4AE] border-none p-6">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Access different sections of Parvarish AI
            </SheetDescription>
            <div className="flex flex-col h-full mt-8">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:bottom-0 w-64 bg-gradient-to-b from-[#A8E6CF] to-[#8BD4AE] p-6 flex-col overflow-y-auto">
        <SidebarContent />
      </div>
    </>
  );
}
