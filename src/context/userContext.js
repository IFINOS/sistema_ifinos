"use client";

// Hooks
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/_lib/supabase/client";

// Utils
import { getRoleFromGroups } from "@/_lib/auth/roles";

const UserContext = createContext(null);
const supabase = createClient();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("visitor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // busca o role do usuário
    const getRole = async (userId) => {
      const { data: grupos, error } = await supabase
        .from("usuarios_grupos")
        .select("grupos!inner(nome)")
        .eq("usuario_id", userId);

      if (error) {
        console.error("Erro ao buscar role:", error);
        return;
      }

      const groupNames =
        grupos?.map((item) => item.grupos?.nome).filter(Boolean) || [];

      const role = getRoleFromGroups(groupNames);
      setUserRole(role);
    };

    // escuta mudanças de sessão em tempo real
    // também dispara imediatamente na montagem se já houver sessão ativa
    // ex: login, logout, refresh de token, carregamento inicial
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
