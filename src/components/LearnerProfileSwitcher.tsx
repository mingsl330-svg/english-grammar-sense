import { type FormEvent, useEffect, useState } from "react";
import { learningVersionConfigs } from "../data/learningVersions";
import type { LearnerProfile } from "../services/learnerProfileService";
import type { LearningVersion, StudyPace } from "../types/learning";

interface LearnerProfileSwitcherProps {
  activeProfile: LearnerProfile;
  profiles: LearnerProfile[];
  onCreate: (displayName: string, learningVersion: LearningVersion) => void;
  onSelect: (profileId: string) => void;
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
  onUpdateActive
}: LearnerProfileSwitcherProps) {
  const [newName, setNewName] = useState("");
  const [newVersion, setNewVersion] = useState<LearningVersion>(activeProfile.learningVersion);
  const [editingName, setEditingName] = useState(activeProfile.displayName);

  useEffect(() => {
    setEditingName(activeProfile.displayName);
    setNewVersion(activeProfile.learningVersion);
  }, [activeProfile.displayName, activeProfile.learningVersion]);

  const submitNewProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate(newName, newVersion);
    setNewName("");
  };

  const commitName = () => {
    if (editingName.trim() && editingName.trim() !== activeProfile.displayName) {
      onUpdateActive({ displayName: editingName });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
      <select
        aria-label="选择学习者"
        className="h-9 rounded-md border border-line bg-white px-2 text-sm font-semibold text-ink"
        onChange={(event) => {
          onSelect(event.target.value);
          const selected = profiles.find((profile) => profile.id === event.target.value);
          if (selected) {
            setEditingName(selected.displayName);
            setNewVersion(selected.learningVersion);
          }
        }}
        value={activeProfile.id}
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.displayName}
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

      <form className="flex flex-wrap items-center gap-2" onSubmit={submitNewProfile}>
        <input
          aria-label="新学习者昵称"
          className="h-9 w-28 rounded-md border border-line px-2 text-sm text-ink"
          onChange={(event) => setNewName(event.target.value)}
          placeholder="新学生"
          value={newName}
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
          disabled={!newName.trim()}
          type="submit"
        >
          新增
        </button>
      </form>
    </div>
  );
}
