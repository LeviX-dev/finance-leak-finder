import { Link } from "@tanstack/react-router";
import {
  Bell,
  Command,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/providers/theme-provider";
import { useMockAuth } from "@/providers/mock-auth-provider";
import { roleMap } from "@/constants/navigation";
import { alerts } from "@/data/mock";
import { SeverityBadge } from "@/components/common/tone-badge";

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useMockAuth();
  const role = roleMap[user.role];
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <header className="glass-panel sticky top-0 z-20 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-none border-x-0 border-t-0 px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenNav}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="relative min-w-0 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leaks, vendors, invoices…"
          aria-label="Global search"
          className="h-9 pr-16 pl-9"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          <Command className="size-3" />K
        </kbd>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="hidden sm:inline-flex"
        >
          {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Help" className="hidden sm:inline-flex">
          <HelpCircle className="size-4.5" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[340px] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <Link to="/notifications" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {alerts.map((a) => (
                <li key={a.id} className="px-4 py-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{a.time}</p>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 flex items-center gap-2 rounded-full border border-border p-1 pr-3 transition-colors hover:bg-muted"
              aria-label="Account menu"
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium md:inline">{role.label}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/security">
                <ShieldCheck className="size-4" /> Account security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login">
                <LogOut className="size-4" /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
