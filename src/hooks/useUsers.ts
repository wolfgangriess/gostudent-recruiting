import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;

interface UserWithRole extends ProfileRow {
  role: string | null;
}

// ---- Query keys ----
export const userKeys = {
  all: ["users"] as const,
  current: ["users", "current"] as const,
};

// ---- Queries ----

/** Fetch all users (profiles joined with their role) */
export const useUsers = () =>
  useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<UserWithRole[]> => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name", { ascending: true });
      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

      return (profiles ?? []).map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? "employee",
      }));
    },
  });

/** Fetch the current authenticated user's full profile */
export const useCurrentUser = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: userKeys.current,
    queryFn: async (): Promise<UserWithRole | null> => {
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

      return profile
        ? { ...profile, role: roleRow?.role ?? "employee" }
        : null;
    },
    enabled: !!user,
  });
};
