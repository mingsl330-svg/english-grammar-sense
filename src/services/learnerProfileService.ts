import type { LearningVersion, PlacementResult, StudyPace } from "../types/learning";

export interface LearnerProfile {
  id: string;
  displayName: string;
  learningVersion: LearningVersion;
  studyPace: StudyPace;
  accessCodeHash?: string;
  placement?: PlacementResult;
  createdAt: string;
  lastActiveAt: string;
}

interface LearnerProfileState {
  activeProfile: LearnerProfile;
  profiles: LearnerProfile[];
}

const PROFILES_STORAGE_KEY = "english-grammar-sense-learner-profiles";
const ACTIVE_PROFILE_STORAGE_KEY = "english-grammar-sense-active-learner";
const LEGACY_VERSION_STORAGE_KEY = "english-grammar-sense-learning-version";

export const DEFAULT_LOCAL_LEARNER_ID = "default-local-learner";

const normalizeName = (name: string) => {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed || "学习者";
};

const nowIso = () => new Date().toISOString();

const normalizeAccessCode = (accessCode?: string) => accessCode?.trim() ?? "";

const hashAccessCode = (profileId: string, accessCode?: string) => {
  const normalized = normalizeAccessCode(accessCode);
  if (!normalized) return undefined;
  let hash = 2166136261;
  const source = `${profileId}:${normalized}`;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `local-${(hash >>> 0).toString(16).padStart(8, "0")}`;
};

const canAccessProfile = (profile: LearnerProfile, accessCode?: string) =>
  !profile.accessCodeHash || profile.accessCodeHash === hashAccessCode(profile.id, accessCode);

const readProfiles = (): LearnerProfile[] => {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LearnerProfile[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((profile) => profile.id && profile.displayName);
  } catch {
    return [];
  }
};

const writeProfiles = (profiles: LearnerProfile[]) => {
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
};

const defaultLearningVersion = (): LearningVersion => {
  const stored = localStorage.getItem(LEGACY_VERSION_STORAGE_KEY);
  return stored === "primary_junior" ? "primary_junior" : "high_school";
};

const createDefaultProfile = (): LearnerProfile => {
  const currentTime = nowIso();
  return {
    id: DEFAULT_LOCAL_LEARNER_ID,
    displayName: "默认学习者",
    learningVersion: defaultLearningVersion(),
    studyPace: "steady",
    createdAt: currentTime,
    lastActiveAt: currentTime
  };
};

const sortProfiles = (profiles: LearnerProfile[]) =>
  [...profiles].sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));

export const learnerProfileService = {
  load(): LearnerProfileState {
    let profiles = readProfiles();
    if (profiles.length === 0) {
      profiles = [createDefaultProfile()];
      writeProfiles(profiles);
    }

    const activeId = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    const activeProfile = profiles.find((profile) => profile.id === activeId) ?? profiles[0];
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfile.id);

    return {
      activeProfile,
      profiles: sortProfiles(profiles)
    };
  },

  create(input: {
    displayName: string;
    learningVersion: LearningVersion;
    studyPace?: StudyPace;
    accessCode?: string;
  }): LearnerProfileState {
    const profiles = readProfiles();
    const currentTime = nowIso();
    const id = crypto.randomUUID();
    const profile: LearnerProfile = {
      id,
      displayName: normalizeName(input.displayName),
      learningVersion: input.learningVersion,
      studyPace: input.studyPace ?? "steady",
      accessCodeHash: hashAccessCode(id, input.accessCode),
      createdAt: currentTime,
      lastActiveAt: currentTime
    };

    const nextProfiles = sortProfiles([profile, ...profiles]);
    writeProfiles(nextProfiles);
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profile.id);

    return {
      activeProfile: profile,
      profiles: nextProfiles
    };
  },

  activate(profileId: string, accessCode?: string): LearnerProfileState {
    const currentTime = nowIso();
    const targetProfile = readProfiles().find((profile) => profile.id === profileId);
    if (targetProfile && !canAccessProfile(targetProfile, accessCode)) {
      throw new Error("ACCESS_CODE_REQUIRED");
    }
    const profiles = readProfiles().map((profile) =>
      profile.id === profileId ? { ...profile, lastActiveAt: currentTime } : profile
    );
    const activeProfile = profiles.find((profile) => profile.id === profileId) ?? profiles[0] ?? createDefaultProfile();
    const nextProfiles = profiles.length > 0 ? sortProfiles(profiles) : [activeProfile];

    writeProfiles(nextProfiles);
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfile.id);

    return {
      activeProfile,
      profiles: nextProfiles
    };
  },

  updateActive(input: Partial<Pick<LearnerProfile, "displayName" | "learningVersion" | "placement" | "studyPace">>): LearnerProfileState {
    const { activeProfile } = this.load();
    const profiles = readProfiles();
    const currentTime = nowIso();
    const updated = {
      ...activeProfile,
      ...input,
      displayName: input.displayName ? normalizeName(input.displayName) : activeProfile.displayName,
      lastActiveAt: currentTime
    };
    const nextProfiles = sortProfiles(profiles.map((profile) => (profile.id === updated.id ? updated : profile)));

    writeProfiles(nextProfiles);
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, updated.id);

    return {
      activeProfile: updated,
      profiles: nextProfiles
    };
  },

  updateActiveAccessCode(accessCode: string): LearnerProfileState {
    const normalized = normalizeAccessCode(accessCode);
    if (normalized.length < 4) {
      throw new Error("ACCESS_CODE_TOO_SHORT");
    }

    const { activeProfile } = this.load();
    const profiles = readProfiles();
    const currentTime = nowIso();
    const updated = {
      ...activeProfile,
      accessCodeHash: hashAccessCode(activeProfile.id, normalized),
      lastActiveAt: currentTime
    };
    const nextProfiles = sortProfiles(profiles.map((profile) => (profile.id === updated.id ? updated : profile)));

    writeProfiles(nextProfiles);
    localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, updated.id);

    return {
      activeProfile: updated,
      profiles: nextProfiles
    };
  }
};
