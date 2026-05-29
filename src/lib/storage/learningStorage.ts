import type { UserLearningProfile } from "../../types/profile";
import type { TodayPath } from "../../types/today-path";

const PROFILE_KEY = "english-grammar-sense-learning-profile";
const todayPathKey = (date: string, userId: string) => `english-grammar-sense-today-path:${userId}:${date}`;

export function saveLearningProfile(profile: UserLearningProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}

export function loadLearningProfile(): UserLearningProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserLearningProfile) : null;
  } catch {
    return null;
  }
}

export function saveTodayPath(path: TodayPath): void {
  localStorage.setItem(todayPathKey(path.date, path.userId), JSON.stringify(path));
}

export function loadTodayPath(date: string, userId = "local-user"): TodayPath | null {
  try {
    const raw = localStorage.getItem(todayPathKey(date, userId));
    return raw ? (JSON.parse(raw) as TodayPath) : null;
  } catch {
    return null;
  }
}
