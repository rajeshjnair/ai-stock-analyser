import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarWidth?: number;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function AppShell({
  children,
  header,
  sidebar,
  footer,
  sidebarWidth = 256,
  sidebarCollapsed = false,
  className,
}: AppShellProps) {
  const actualSidebarWidth = sidebarCollapsed ? 72 : sidebarWidth;

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {header && (
        <header
          className="fixed top-0 right-0 z-40 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
          style={{ left: sidebar ? actualSidebarWidth : 0 }}
        >
          {header}
        </header>
      )}

      {/* Sidebar */}
      {sidebar && (
        <aside
          className="fixed left-0 top-0 z-50 h-screen border-r border-border bg-card transition-all duration-300"
          style={{ width: actualSidebarWidth }}
        >
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          header && 'pt-16',
          footer && 'pb-16'
        )}
        style={{ marginLeft: sidebar ? actualSidebarWidth : 0 }}
      >
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer
          className="fixed bottom-0 right-0 z-40 h-16 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
          style={{ left: sidebar ? actualSidebarWidth : 0 }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}

// Top navigation variant (no sidebar)
export interface TopNavShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function TopNavShell({
  children,
  header,
  footer,
  className,
}: TopNavShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {header}
      </header>

      {/* Main Content */}
      <main className={cn('min-h-screen pt-16', footer && 'pb-16')}>
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer className="border-t border-border bg-card">{footer}</footer>
      )}
    </div>
  );
}
