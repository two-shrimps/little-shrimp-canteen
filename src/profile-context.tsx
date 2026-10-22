import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type ProfileState = {
  displayName: string;
  defaultServings: number;
};

type ProfileContextValue = ProfileState & {
  updateProfile: (profile: ProfileState) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<ProfileState>({
    displayName: 'Katrina',
    defaultServings: 2,
  });

  const value = useMemo(
    () => ({ ...profile, updateProfile: setProfile }),
    [profile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used inside ProfileProvider');
  return context;
}
