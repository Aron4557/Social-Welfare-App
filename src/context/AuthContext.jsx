/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (targetUser) => {
    if (!targetUser) {
      setProfile(null);
      return null;
    }
    const userProfile = await getDoc(doc(db, "users", targetUser.uid));
    if (userProfile.exists()) {
      const nextProfile = { id: userProfile.id, ...userProfile.data(), role: "user" };
      setProfile(nextProfile);
      return nextProfile;
    }
    const professionalProfile = await getDoc(doc(db, "Professionals", targetUser.uid));
    if (professionalProfile.exists()) {
      const nextProfile = {
        id: professionalProfile.id,
        ...professionalProfile.data(),
        role: "professional",
      };
      setProfile(nextProfile);
      return nextProfile;
    }
    setProfile(null);
    return null;
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (nextUser) => {
        setUser(nextUser);
        setProfile(null);
        if (nextUser) await refreshProfile(nextUser);
        setLoading(false);
      }),
    [refreshProfile],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isProfessional: profile?.role === "professional",
      refreshProfile,
      logout: () => signOut(auth),
    }),
    [user, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
