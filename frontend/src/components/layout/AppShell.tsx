import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header akan dipanggil di sini */}

      <main className="mx-auto w-full max-w-[1440px] px-6 py-8">
        {children}
      </main>

      {/* Footer akan dipanggil di sini */}
    </div>
  );
}