import { type FormEvent, useEffect, useState } from "react";
import { learningVersionConfigs } from "../data/learningVersions";
import type { LearnerProfile } from "../services/learnerProfileService";
import type { LearningVersion, StudyPace } from "../types/learning";

interface LearnerProfileSwitcherProps {
  activeProfile: LearnerProfile;
  profiles: LearnerProfile[];
  onCreate: (displayName: string, learningVersion: LearningVersion, accessCode: string) => void;
  onSelect: (profileId: string, accessCode?: string) => boolean;
  onSetAccessCode: (accessCode: string) => void;
  onUpdateActive: (input: Partial<Pick<LearnerProfile, "displayName" | "studyPace">>) => void;
}

const paceLabels: Record<StudyPace, string> = {
  gentle: "轻量",
  steady: "标准",
  stretch: "进阶"
};

export function LearnerProfileSwitcher({
  activeProfile,
  profiles,
  onCreate,
  onSelect,
  onSetAccessCode,
  onUpdateActive
}: LearnerProfileSwitcherProps) {
  const [newName, setNewName] = useState("");
  const [newAccessCode, setNewAccessCode] = useState("");
  const [newVersion, setNewVersion] = useState<LearningVersion>(activeProfile.learningVersion);
  const [editingName, setEditingName] = useState(activeProfile.displayName);
  const [pendingProfileId, setPendingProfileId] = useState<string>();
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [activeAccessCode, setActiveAccessCode] = useState("");

  useEffect(() => {
    setEditingName(activeProfile.displayName);
    setNewVersion(activeProfile.learningVersion);
    setPendingProfileId(undefined);
    setUnlockCode("");
    setUnlockError("");
  }, [activeProfile.displayName, activeProfile.id, activeProfile.learningVersion]);

  const submitNewProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newAccessCode.trim().length < 4) return;
    onCreate(newName, newVersion, newAccessCode);
    setNewName("");
    setNewAccessCode("");
  };

  const commitName = () => {
    if (editingName.trim() && editingName.trim() !== activeProfile.displayName) {
      onUpdateActive({ displayName: editingName });
    }
  };

  const selectProfile = (profileId: string) => {
    if (profileId === activeProfile.id) return;
    const selected = profiles.find((profile) => profile.id === profileId);
    if (!selected) return;
    if (selected.accessCodeHash) {
      setPendingProfileId(profileId);
      setUnlockCode("");
      setUnlockError("");
      return;
    }
    if (!onSelect(profileId)) setUnlockError("访问码不正确");
  };

  const unlockPendingProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingProfileId) return;
    const unlocked = onSelect(pendingProfileId, unlockCode);
    if (unlocked) {
      setPendingProfileId(undefined);
      setUnlockCode("");
      setUnlockError("");
      return;
    }
    setUnlockError("访问码不正确");
  };

  const commitAccessCode = () => {
    if (activeAccessCode.trim().length < 4) return;
    onSetAccessCode(activeAccessCode);
    setActiveAccessCode("");
  };

  const pendingProfile = profiles.find((profile) => profile.id === pendingProfileId);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
      <select
        aria-label="选择学习者"
        className="h-9 rounded-md border border-line bg-white px-2 text-sm font-semibold text-ink"
        onChange={(event) => selectProfile(event.target.value)}
        value={activeProfile.id}
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.accessCodeHash ? "锁定 · " : ""}{profile.displayName}
          </option>
        ))}
      </select>

      <input
        aria-label="当前学习者昵称"
        className="h-9 w-28 rounded-md border border-line px-2 text-sm text-ink"
        onBlur={commitName}
        onChange={(event) => setEditingName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        value={editingName}
      />

      <select
        aria-label="学习节奏"
        className="h-9 rounded-md border border-line bg-white px-2 text-sm text-muted"
        onChange={(event) => onUpdateActive({ studyPace: event.target.value as StudyPace })}
        value={activeProfile.studyPace}
      >
        {(Object.keys(paceLabels) as StudyPace[]).map((pace) => (
          <option key={pace} value={pace}>
            {paceLabels[pace]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 border-l border-line pl-2">
        <input
          aria-label="当前学习者访问码"
          className="h-9 w-28 rounded-md border border-line px-2 text-sm text-ink"
          onChange={(event) => setActiveAccessCode(event.target.value)}
          placeholder={activeProfile.accessCodeHash ? "更换访问码" : "设访问码"}
          type="password"
          value={activeAccessCode}
        />
        <button
          className="h-9 rounded-md border border-line px-3 text-sm font-bold text-muted hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-50"
          disabled={activeAccessCode.trim().length < 4}
          onClick={commitAccessCode}
          type="button"
        >
          {activeProfile.accessCodeHash ? "更换" : "设定"}
        </button>
      </div>

      {pendingProfile && (
        <form className="flex flex-wrap items-center gap-2 border-l border-line pl-2" onSubmit={unlockPendingProfile}>
          <span className="text-xs font-semibold text-muted">解锁 {pendingProfile.displayName}</span>
          <input
            aria-label="输入学习者访问码"
            className="h-9 w-24 rounded-md border border-line px-2 text-sm text-ink"
            onChange={(event) => setUnlockCode(event.target.value)}
            placeholder="访问码"
            type="password"
            value={unlockCode}
          />
          <button
            className="h-9 rounded-md bg-ocean px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={unlockCode.trim().length < 4}
            type="submit"
          >
            进入
          </button>
          {unlockError && <span className="text-xs font-semibold text-rose">{unlockError}</span>}
        </form>
      )}

      <form className="flex flex-wrap items-center gap-2" onSubmit={submitNewProfile}>
        <input
          aria-label="新学习者昵称"
          className="h-9 w-28 rounded-md border border-line px-2 text-sm text-ink"
          onChange={(event) => setNewName(event.target.value)}
          placeholder="新学生"
          value={newName}
        />
        <input
          aria-label="新学习者访问码"
          className="h-9 w-24 rounded-md border border-line px-2 text-sm text-ink"
          onChange={(event) => setNewAccessCode(event.target.value)}
          placeholder="访问码"
          type="password"
          value={newAccessCode}
        />
        <select
          aria-label="新学习者学段"
          className="h-9 rounded-md border border-line bg-white px-2 text-sm text-muted"
          onChange={(event) => setNewVersion(event.target.value as LearningVersion)}
          value={newVersion}
        >
          {(Object.keys(learningVersionConfigs) as LearningVersion[]).map((version) => (
            <option key={version} value={version}>
              {learningVersionConfigs[version].shortLabel}
            </option>
          ))}
        </select>
        <button
          className="h-9 rounded-md bg-ink px-3 text-sm font-bold text-white hover:bg-ocean"
          disabled={!newName.trim() || newAccessCode.trim().length < 4}
          type="submit"
        >
          新增
        </button>
      </form>
    </div>
  );
}
