import { Sidebar } from "@/components/shared/sidebar";
import { getUser } from "@/lib/dal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-6">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {user?.name}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
