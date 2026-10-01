import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { config } from '../api/client';
import { cx } from './ui';
import { setThemePreference, useThemePreference } from '../lib/useColorScheme';

const nav = [
  { to: '/', label: 'Home', icon: '⌂', end: true },
  { to: '/learn', label: 'Lessons', icon: '◎' },
  { to: '/gallery', label: 'Use cases', icon: '▦' },
  { to: '/playground', label: 'Playground', icon: '⚗' },
  { to: '/concepts', label: 'Concepts', icon: '✎' },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const theme = useThemePreference();
  const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
  const themeLabel = `${theme[0].toUpperCase()}${theme.slice(1)} theme. Switch to ${nextTheme}.`;
  return (
    <div className="flex h-full">
      <aside
        className={cx(
          'flex shrink-0 flex-col border-r border-line bg-page transition-[width]',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className="flex h-14 items-center gap-2 px-4">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand text-sm text-on-brand"
          >
            ▶
          </span>
          {!collapsed && (
            <span className="text-[13px] leading-tight font-semibold tracking-tight">
              Decision Models
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto text-faint hover:text-ink"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              title={n.label}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brand font-medium text-on-brand'
                    : 'text-muted hover:bg-sunken hover:text-ink',
                )
              }
            >
              <span className="w-4 text-center" aria-hidden>
                {n.icon}
              </span>
              {!collapsed && n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <div
            className={cx(
              'flex items-center gap-2 border-t border-line px-3 py-3',
              collapsed ? 'justify-center' : 'justify-between',
            )}
          >
            {!collapsed && (
              <div
                className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted"
                title={
                  config.baseUrl
                    ? `${config.baseUrl}${config.endpointPath} · ${config.hasKey ? 'API key loaded' : 'No API key'}`
                    : 'Endpoint not configured'
                }
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    config.baseUrl && config.hasKey ? 'bg-good' : 'bg-bad',
                  )}
                />
                <span className="truncate">
                  {config.baseUrl
                    ? config.baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
                    : 'Not configured'}
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label={themeLabel}
              title={themeLabel}
              onClick={() => setThemePreference(nextTheme)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-accent hover:bg-sunken hover:text-ink"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {theme === 'system' ? (
                  <>
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M12 16v4m-4 0h8" />
                  </>
                ) : theme === 'light' ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
                  </>
                ) : (
                  <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
