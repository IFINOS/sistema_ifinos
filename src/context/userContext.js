"use client";

// Hooks
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/_lib/supabase/client";

// Utils
import { getRoleFromGroups } from "@/_lib/auth/roles";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("visitor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // busca o usuário atual
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        await getRole(user.id);
      }

      setLoading(false);
    };

    // busca o role do usuário
    const getRole = async (userId) => {
      const { data: grupos } = await supabase
        .from("usuarios_grupos")
        .select("grupos(nome)")
        .eq("usuario_id", userId);

      const groupNames = grupos?.map((g) => g.grupos.nome) ?? [];
      setUserRole(getRoleFromGroups(groupNames));
    };

    getUser();

    // escuta mudanças de sessão em tempo real
    // ex: login, logout, refresh de token
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await getRole(session.user.id);
      } else {
        setUser(null);
        setUserRole("visitor");
      }
      setLoading(false);
    });

    // remove o listener quando o componente desmonta
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser deve ser usado dentro de UserProvider");
  return context;
}
