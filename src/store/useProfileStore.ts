import { create } from 'zustand';

import * as profileDb from '../db/profile';
import { Gender } from '../api/types';

type ProfileState = {
  loaded: boolean;
  birthDate: string | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  load: () => void;
  save: (profile: profileDb.Profile) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  loaded: false,
  birthDate: null,
  gender: null,
  heightCm: null,
  weightKg: null,

  load: () => {
    const profile = profileDb.getProfile();
    set({
      loaded: true,
      birthDate: profile?.birthDate ?? null,
      gender: profile?.gender ?? null,
      heightCm: profile?.heightCm ?? null,
      weightKg: profile?.weightKg ?? null,
    });
  },

  save: (profile) => {
    profileDb.saveProfile(profile);
    set({
      birthDate: profile.birthDate,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
    });
  },
}));

export function isProfileComplete(s: ProfileState): boolean {
  return s.birthDate !== null && s.gender !== null && s.heightCm !== null && s.weightKg !== null;
}
