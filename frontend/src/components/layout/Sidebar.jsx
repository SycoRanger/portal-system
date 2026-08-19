import { NavLink } from 'react-router-dom';
import { GraduationCap as Logo, X, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { NAV_BY_ROLE, ROLE_LABEL } from './navConfig';
import Avatar from '../ui/Avatar';
import { fullName, cn } from '../../utils/format';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const sections = NAV_BY_ROLE[user?.role] || [];

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg">
          <Logo size={18} />
        </div>
        <span className="text-base font-bold tracking-tight text-ink">Edunova</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {sections.map((section) => (
          <div key={section.section} className="mb-5">
            <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              {section.section}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-soft text-primary'
                        : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                    )
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar name={fullName(user)} size={34} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{fullName(user)}</div>
            <div className="truncate text-xs text-ink-muted">{ROLE_LABEL[user?.role]}</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-danger-soft hover:text-danger transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-950/50" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-[slide-up_0.2s_ease-out] bg-surface shadow-popover">
            <button
              onClick={onCloseMobile}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-hover"
            >
              <X size={17} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
