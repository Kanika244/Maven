import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Scale,
  LineChart,
  Newspaper,
  MessagesSquare,
  Brain,
  UserRound,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; to: string; icon: LucideIcon; group: string };

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, group: "Overview" },
  { label: "Portfolio", to: "/portfolio", icon: Briefcase, group: "Overview" },
  { label: "AI Recommendations", to: "/recommendations", icon: Sparkles, group: "Intelligence" },
  { label: "Rebalancing", to: "/rebalancing", icon: Scale, group: "Intelligence" },
  { label: "Explainability", to: "/explainability", icon: Brain, group: "Intelligence" },
  { label: "AI Assistant", to: "/assistant", icon: MessagesSquare, group: "Intelligence" },
  { label: "Market Intelligence", to: "/market", icon: LineChart, group: "Markets" },
  { label: "News & Sentiment", to: "/news", icon: Newspaper, group: "Markets" },
  { label: "Investor Profile", to: "/profile", icon: UserRound, group: "Account" },
  { label: "Settings", to: "/settings", icon: Settings, group: "Account" },
];

export const navGroups = ["Overview", "Intelligence", "Markets", "Account"];