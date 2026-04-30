import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
  Ticket,
  UserCircle2,
  Users,
} from 'lucide-react';
import { ChatWidget } from '@/components/chatbot/chat-widget.jsx';
import { Sidebar } from './sidebar.jsx';
import { Topbar } from './topbar.jsx';

const iconMap = {
  Dashboard: LayoutDashboard,
  Employees: Users,
  Attendance: CalendarDays,
  Leaves: ReceiptText,
  Tasks: ListChecks,
  Jobs: BriefcaseBusiness,
  Interviews: ClipboardList,
  Analytics: BarChart3,
  Tickets: Ticket,
  Notifications: Bell,
  Salary: ReceiptText,
  Profile: UserCircle2,
  'Interview Prep': ClipboardList,
};

export function ShellLayout({ brand, basePath, menu }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('hrms-pro-theme') || 'dark');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('hrms-pro-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const items = useMemo(
    () =>
      menu.map((item) => ({
        label: item,
        href: `${basePath}/${item.toLowerCase().replace(/\s+/g, '-')}`,
        icon: iconMap[item] || LayoutDashboard,
      })),
    [basePath, menu]
  );

  return (
    <div className="min-h-screen bg-hero-gradient px-4 py-4 text-slate-100 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4">
        <div className="hidden lg:block">
          <Sidebar brand={brand} items={items} collapsed={collapsed} />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden">
            <div className="h-full w-[280px] p-4">
              <Sidebar brand={brand} items={items} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-full flex-1 flex-col gap-4">
          <Topbar
            onToggleSidebar={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen((value) => !value);
              } else {
                setCollapsed((value) => !value);
              }
            }}
            theme={theme}
            onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          />
          <main className="page-fade flex-1 rounded-[32px] border border-white/10 bg-slate-950/40 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
