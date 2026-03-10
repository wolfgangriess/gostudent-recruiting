import { useState, useRef, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useATSStore } from "@/lib/ats-store";
import { User } from "@/lib/types";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label: string;
  placeholder?: string;
  filterRole?: string;
}

const UserAvatar = ({ user, size = "sm" }: { user: User; size?: "sm" | "md" }) => {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const sizeClasses = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ${sizeClasses}`}>
      {initials}
    </div>
  );
};

const roleBadge: Record<string, string> = {
  admin: "TA Team",
  hiring_manager: "Hiring Mgr",
  employee: "Employee",
};

const UserPicker = ({ selectedIds, onChange, label, placeholder = "Search users…", filterRole }: Props) => {
  const { users } = useATSStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>

      {/* Selected chips */}
      {selectedUsers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedUsers.map((u) => (
            <Badge
              key={u.id}
              variant="secondary"
              className="gap-1.5 rounded-lg py-1 pl-1.5 pr-2 bg-muted text-foreground border-0"
            >
              <UserAvatar user={u} />
              <span className="text-xs font-medium">{u.firstName} {u.lastName}</span>
              <button
                type="button"
                onClick={() => toggle(u.id)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-8 h-9 rounded-lg"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {filteredUsers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No users found</div>
          ) : (
            filteredUsers.map((u) => {
              const selected = selectedIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggle(u.id)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    selected ? "bg-primary/5" : ""
                  }`}
                >
                  <UserAvatar user={u} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.department}</p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                    {roleBadge[u.role] || u.role}
                  </span>
                  {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export { UserAvatar };
export default UserPicker;
