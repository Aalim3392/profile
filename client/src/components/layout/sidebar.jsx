import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.js';

export function Sidebar({ brand, items, collapsed, onNavigate }) {
  return (
    <aside
      className={cn(
        'glass-panel flex h-full flex-col rounded-[30px] border border-white/10 px-4 py-6 transition-all duration-300',
        collapsed ? 'w-[92px]' : 'w-[280px]'
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 font-bold text-white shadow-lg shadow-indigo-500/30">
          H
        </div>
        {!collapsed && (
          <div>
            <p className="text-lg font-semibold text-white">{brand}</p>
            <p className="text-xs text-slate-400">AI-powered HR workspace</p>
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-300 transition duration-300',
                isActive
                  ? 'bg-indigo-500/20 text-white shadow-[0_0_32px_rgba(99,102,241,0.25)]'
                  : 'hover:bg-white/5 hover:text-white'
              )
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-indigo-200">
              <item.icon className="h-4 w-4" />
            </span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
