import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import { mapUser, mapUsers } from "@/lib/mappers";
import type { User } from "@/lib/types";

type ProfileRow = Tables<"profiles">;

interface ProfileWithRole extends ProfileRow {
  role: string | null;
}

// ---- Query keys ----
export const userKeys = {
  all: ["users"] as const,
  current: ["users", "current"] as const,
};

// ---- Queries ----

/** Fetch all users, returning camelCase User[] */
export const useUsers = () =>
  useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User[]> => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name", { ascending: true });
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

      const withRoles: ProfileWithRole[] = (profiles ?? []).map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? "employee",
      }));

      return mapUsers(withRoles);
    },
  });

/** Fetch the current authenticated user's full profile, returning camelCase User */
export const useCurrentUser = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.current,
    queryFn: async (): Promise<User | null> => {
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return null;
      return mapUser({ ...profile, role: roleRow?.role ?? "employee" });
    },
    enabled: !!user,
  });
};
