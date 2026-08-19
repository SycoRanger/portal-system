import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';
import { fullName } from '../../utils/format';
import { ROLE_LABEL } from './navConfig';

export default function Header({ title, onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover lg:hidden"
      >
        <Menu size={19} />
      </button>

      <h2 className="flex-1 truncate text-sm font-semibold text-ink sm:text-base">{title}</h2>

      <button
        onClick={toggle}
        title="Toggle theme"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover transition-colors"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <button className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover sm:flex">
        <Bell size={17} />
      </button>

      <div className="hidden items-center gap-2.5 border-l border-border pl-3 sm:flex">
        <Avatar name={fullName(user)} size={32} />
        <div className="leading-tight">
          <div className="text-xs font-semibold text-ink">{fullName(user)}</div>
          <div className="text-[11px] text-ink-muted">{ROLE_LABEL[user?.role]}</div>
        </div>
      </div>
    </header>
  );
}
