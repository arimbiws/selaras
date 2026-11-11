import { ReactNode } from "react";
import { AiAssistant } from "@/components/ai-assistant";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceSearch } from "@/components/workspace-search";

export function PageShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <div className="app-wrap">
      <div className="app">
        <AppSidebar active={active} />

        <div className="main">
          <header className="bar">
            <div className="tools">
              <WorkspaceSearch />
            </div>
          </header>

          {children}
        </div>
      </div>
      <AiAssistant />
    </div>
  );
}
