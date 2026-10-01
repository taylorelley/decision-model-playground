import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { config } from '../api/client';
import { cx } from './ui';

const nav = [
  { to: '/', label: 'Home', icon: '⌂', end: true },
  { to: '/learn', label: 'Lessons', icon: '◎' },
  { to: '/gallery', label: 'Use-case gallery', icon: '▦' },
  { to: '/playground', label: 'Playground', icon: '⚗' },
  { to: '/concepts', label: 'Concepts', icon: '✎' },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-full">
      <aside
        className={cx(
          'flex shrink-0 flex-col border-r border-line bg-page transition-[width]',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className="flex h-14 items-center gap-2 px-4">
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          {!collapsed && (
            <span className="text-[13px] leading-tight font-semibold tracking-tight">
              Decision Model
              <br />
              Playground
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
                    ? 'bg-sunken font-medium text-ink'
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
          <a
            href="https://docs.typesafe.ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-sunken hover:text-ink"
            title="TypeSafe documentation"
          >
            <span className="w-4 text-center" aria-hidden>
              ↗
            </span>
            {!collapsed && 'Documentation'}
          </a>
        </nav>
        {!collapsed && (
          <div className="mt-auto m-3 rounded-lg border border-line bg-surface p-3 text-xs">
            <div className="text-muted">Endpoint</div>
            <div className="truncate font-mono text-[11px]" title={config.baseUrl}>
              {config.baseUrl.replace(/^https?:\/\//, '')}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={cx('h-2 w-2 rounded-full', config.hasKey ? 'bg-good' : 'bg-bad')} />
              <span className={config.hasKey ? 'text-muted' : 'text-bad'}>
                {config.hasKey ? 'API key loaded' : 'No API key'}
              </span>
            </div>
          </div>
        )}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        {!config.hasKey && <KeyBanner />}
        <div className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function KeyBanner() {
  return (
    <div role="status" className="border-b border-warn/30 bg-warn/10 px-4 py-2 text-xs text-ink">
      <strong>No API key set.</strong> You can browse lessons and build requests, but running them
      needs a key. Copy <code className="font-mono">.env.example</code> to{' '}
      <code className="font-mono">.env</code>, set{' '}
      <code className="font-mono">TYPESAFE_API_KEY</code>, then restart{' '}
      <code className="font-mono">npm run dev</code>.
    </div>
  );
}
