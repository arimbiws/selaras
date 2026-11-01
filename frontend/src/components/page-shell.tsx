import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceSearch } from "@/components/workspace-search";

export function PageShell({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="app-wrap">
      <div className="app">
        <AppSidebar active={active} />

        <div className="main">
          <header className="bar">
            <nav className="crumb" aria-label="Jejak halaman">
              SELARAS <span aria-hidden="true">/</span> <b>{title}</b>
            </nav>
            <div className="tools">
              <WorkspaceSearch />
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
