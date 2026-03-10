import { Link, useLocation } from "react-router-dom";
import { Briefcase, Users } from "lucide-react";

const navItems = [
  { to: "/", label: "Jobs", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
];

const TopNav = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Briefcase className="h-5 w-5" />
          <span>TalentFlow</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/" || location.pathname.startsWith("/jobs")
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
