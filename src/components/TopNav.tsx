import { Link, useLocation } from "react-router-dom";
import { Briefcase, Users } from "lucide-react";

const navItems = [
  { to: "/", label: "Jobs", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
];

const TopNav = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Briefcase className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">TalentFlow</span>
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
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
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
