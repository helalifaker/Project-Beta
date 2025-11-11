import {
  BarChart3,
  BookOpenCheck,
  Building2,
  Calculator,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  LineChart,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { JSX } from 'react';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  isActive?: boolean;
  badge?: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarNavItem[];
}

export interface AppSidebarProps {
  sections?: SidebarSection[];
  className?: string;
}

const defaultSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Home', href: '/', icon: Home, isActive: true },
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Planning',
    items: [
      { label: 'Assumptions', href: '/assumptions', icon: Calculator },
      { label: 'Curriculum', href: '/curriculum', icon: BookOpenCheck },
      { label: 'Staffing', href: '/staff', icon: Users },
      { label: 'Capex', href: '/capex', icon: Building2 },
    ],
  },
  {
    title: 'Statements',
    items: [
      { label: 'P&L', href: '/statements/pnl', icon: FileSpreadsheet },
      { label: 'Balance Sheet', href: '/statements/bs', icon: LineChart },
      { label: 'Cash Flow', href: '/statements/cf', icon: TrendingUp },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Templates', href: '/admin/templates', icon: Settings },
      {
        label: 'Workspaces',
        href: '/admin/workspaces',
        icon: Building2,
        badge: 'Admin',
      },
    ],
  },
];

export function AppSidebar({
  sections = defaultSections,
  className,
}: AppSidebarProps): JSX.Element {
  return (
    <aside
      className={cn(
        'hidden w-72 flex-col border-r border-[--color-border] bg-[--color-background] lg:flex',
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-[--color-border] px-6">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[--color-foreground]">
            School Relocation Planner
          </span>
          <span className="text-xs text-[--color-muted-foreground]">
            2028 Relocation Program
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[--color-muted-foreground]">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                      item.isActive
                        ? 'bg-[--color-primary]/10 text-[--color-primary]'
                        : 'text-[--color-muted-foreground] hover:bg-[--color-muted]/60 hover:text-[--color-foreground]',
                    )}
                    aria-current={item.isActive ? 'page' : undefined}
                  >
                    {item.icon ? <item.icon className="size-4 shrink-0" aria-hidden /> : null}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-[--color-secondary] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[--color-secondary-foreground]">
                        {item.badge}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[--color-border] px-4 py-4 text-xs text-[--color-muted-foreground]">
        <div>Scenario v0.1 • Updated just now</div>
      </div>
    </aside>
  );
}


