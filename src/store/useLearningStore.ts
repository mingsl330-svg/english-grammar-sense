import { useSyncExternalStore } from "react";
import { loadLearningProfile, saveLearningProfile, saveTodayPath } from "../lib/storage/learningStorage";
import type { UserLearningProfile } from "../types/profile";
import type { TodayPath } from "../types/today-path";

type LearningState = {
  profile: UserLearningProfile | null;
  todayPath: TodayPath | null;
  isLoadingTodayPath: boolean;
  error: string | null;
};

type LearningStore = LearningState & {
  setProfile: (profile: UserLearningProfile) => void;
  setTodayPath: (path: TodayPath) => void;
  setLoadingTodayPath: (value: boolean) => void;
  setError: (message: string | null) => void;
};

let state: LearningState = {
  profile: loadLearningProfile(),
  todayPath: null,
  isLoadingTodayPath: false,
  error: null
};

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const setState = (next: Partial<LearningState>) => {
  state = { ...state, ...next };
  emit();
};

const store: LearningStore = {
  get profile() {
    return state.profile;
  },
  get todayPath() {
    return state.todayPath;
  },
  get isLoadingTodayPath() {
    return state.isLoadingTodayPath;
  },
  get error() {
    return state.error;
  },
  setProfile(profile) {
    saveLearningProfile(profile);
    setState({ profile });
  },
  setTodayPath(path) {
    saveTodayPath(path);
    setState({ todayPath: path });
  },
  setLoadingTodayPath(value) {
    setState({ isLoadingTodayPath: value });
  },
  setError(message) {
    setState({ error: message });
  }
};

export const learningStore = store;

export function useLearningStore(): LearningStore {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state
  );

  return {
    ...snapshot,
    setProfile: store.setProfile,
    setTodayPath: store.setTodayPath,
    setLoadingTodayPath: store.setLoadingTodayPath,
    setError: store.setError
  };
}
