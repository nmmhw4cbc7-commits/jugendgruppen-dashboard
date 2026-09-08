"use client";

import { useMemo, useState, useTransition } from "react";
import { createAnliegen } from "@/lib/actions/anliegen";
import { createSuggestion, toggleVote } from "@/lib/actions/suggestions";
import EmptyState from "@/components/EmptyState";
import { HeartIcon, LightbulbIcon, PrayingHandsIcon, TargetIcon, ThumbsUpIcon } from "@/components/icons";

type Anliegen = {
  id: string;
  type: string;
  content: string;
  anonymous: boolean;
  createdAt: string;
  displayName: string;
};

type Suggestion = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
  memberName: string;
  voteCount: number;
  votedByMe: boolean;
};

type Tab = "need" | "thanks" | "suggestions";

export default function AnliegenView({
  anliegen,
  suggestions,
}: {
  anliegen: Anliegen[];
  suggestions: Suggestion[];
}) {
  const [tab, setTab] = useState<Tab>("need");
  const [suggestionType, setSuggestionType] = useState<"topic" | "activity">("topic");
  const [formOpen, setFormOpen] = useState(false);

  const needs = useMemo(() => anliegen.filter((a) => a.type === "need"), [anliegen]);
  const thanks = useMemo(() => anliegen.filter((a) => a.type === "thanks"), [anliegen]);
  const topics = useMemo(() => suggestions.filter((s) => s.type === "topic"), [suggestions]);
  const activities = useMemo(() => suggestions.filter((s) => s.type === "activity"), [suggestions]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[21px] font-semibold text-ink tracking-tight">Anliegen</h1>
        <button className="btn-accent text-[13.5px] px-3.5 py-2" onClick={() => setFormOpen(true)}>
          + Teilen
        </button>
      </div>

      <div className="flex gap-1.5 border-b border-line -mx-1 px-1 overflow-x-auto">
        <TabButton active={tab === "need"} onClick={() => setTab("need")}>
          <PrayingHandsIcon className="h-4 w-4" /> Nöte
        </TabButton>
        <TabButton active={tab === "thanks"} onClick={() => setTab("thanks")}>
          <HeartIcon className="h-4 w-4" /> Danksagungen
        </TabButton>
        <TabButton active={tab === "suggestions"} onClick={() => setTab("suggestions")}>
          <LightbulbIcon className="h-4 w-4" /> Vorschläge
        </TabButton>
      </div>

      {tab === "need" && (
        <List
          items={needs}
          empty={{
            title: "Noch keine Anliegen.",
            description: "Teile als Erste/r ein Anliegen mit der Gruppe.",
          }}
        />
      )}
      {tab === "thanks" && (
        <List
          items={thanks}
          empty={{
            title: "Noch keine Danksagungen.",
            description: "Teile als Erste/r, wofür du dankbar bist.",
          }}
        />
      )}

      {tab === "suggestions" && (
        <div className="space-y-4">
          <div className="flex gap-1.5">
            <SegButton active={suggestionType === "topic"} onClick={() => setSuggestionType("topic")}>
              Themen
            </SegButton>
            <SegButton active={suggestionType === "activity"} onClick={() => setSuggestionType("activity")}>
              Aktivitäten
            </SegButton>
          </div>

          {suggestionType === "topic" && (
            <SuggestionList
              items={topics}
              empty={{
                title: "Noch keine Themenvorschläge.",
                description: "Schlage ein Thema für eine Gruppenstunde vor.",
              }}
            />
          )}
          {suggestionType === "activity" && (
            <SuggestionList
              items={activities}
              empty={{
                title: "Noch keine Aktivitätsvorschläge.",
                description: "Schlage eine gemeinsame Aktivität vor.",
              }}
            />
          )}
        </div>
      )}

      {formOpen && (
        <ShareSheet
          initialTab={tab}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 text-[14px] whitespace-nowrap border-b-2 -mb-px transition inline-flex items-center gap-1.5 ${
        active ? "border-ink text-ink font-medium" : "border-transparent text-subtle"
      }`}
    >
      {children}
    </button>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium border transition inline-flex items-center gap-1.5 ${
        active ? "bg-ink text-white border-ink" : "bg-white text-subtle border-line"
      }`}
    >
      {children}
    </button>
  );
}

function List({
  items,
  empty,
}: {
  items: Anliegen[];
  empty: { title: string; description: string };
}) {
  if (items.length === 0) return <EmptyState {...empty} />;
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="card p-4">
          <p className="text-[15px] text-ink leading-relaxed flex items-start gap-1.5">
            {a.type === "need" ? (
              <PrayingHandsIcon className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <HeartIcon className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{a.content}</span>
          </p>
          <p className="text-[13px] text-subtle mt-2.5">{a.displayName}</p>
        </div>
      ))}
    </div>
  );
}

function SuggestionList({
  items,
  empty,
}: {
  items: Suggestion[];
  empty: { title: string; description: string };
}) {
  const [pending, startTransition] = useTransition();
  if (items.length === 0) return <EmptyState {...empty} />;

  return (
    <div className="space-y-3">
      {items.map((s) => (
        <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-ink">{s.title}</p>
            {s.description && (
              <p className="text-[13.5px] text-subtle mt-1 leading-relaxed">{s.description}</p>
            )}
            <p className="text-[12.5px] text-subtle mt-2">{s.memberName}</p>
          </div>
          <button
            disabled={pending}
            onClick={() => startTransition(() => toggleVote(s.id))}
            className={`shrink-0 flex flex-col items-center gap-0.5 rounded-md px-3 py-2 border text-[13px] font-medium transition disabled:opacity-60 ${
              s.votedByMe
                ? "bg-accent text-white border-accent"
                : "bg-white text-ink border-line hover:bg-black/[0.02]"
            }`}
          >
            <ThumbsUpIcon className="h-4 w-4" />
            <span>{s.voteCount}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function ShareSheet({ initialTab, onClose }: { initialTab: Tab; onClose: () => void }) {
  const [mode, setMode] = useState<"anliegen" | "vorschlag">(
    initialTab === "suggestions" ? "vorschlag" : "anliegen"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="bg-card w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-5 pb-8 sm:pb-5 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-[16px] text-ink">Etwas teilen</p>
          <button onClick={onClose} className="text-subtle text-[14px] px-2 py-1">
            Schließen
          </button>
        </div>

        <div className="flex gap-1.5 mb-4">
          <SegButton active={mode === "anliegen"} onClick={() => setMode("anliegen")}>
            Anliegen
          </SegButton>
          <SegButton active={mode === "vorschlag"} onClick={() => setMode("vorschlag")}>
            Vorschlag
          </SegButton>
        </div>

        {mode === "anliegen" ? (
          <AnliegenForm onDone={onClose} />
        ) : (
          <SuggestionForm onDone={onClose} />
        )}
      </div>
    </div>
  );
}

function AnliegenForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<"need" | "thanks">("need");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("type", type);
    fd.set("content", content);
    if (anonymous) fd.set("anonymous", "on");
    startTransition(async () => {
      const res = await createAnliegen(fd);
      if (res?.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="label">Was möchtest du teilen?</p>
        <div className="flex gap-1.5">
          <SegButton active={type === "need"} onClick={() => setType("need")}>
            <PrayingHandsIcon className="h-4 w-4" /> Bitte / Not
          </SegButton>
          <SegButton active={type === "thanks"} onClick={() => setType("thanks")}>
            <HeartIcon className="h-4 w-4" /> Danksagung
          </SegButton>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="content">
          Dein Anliegen
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="field resize-none"
          placeholder={type === "need" ? "Bitte betet für …" : "Ich bin dankbar für …"}
          maxLength={1000}
        />
      </div>

      <label className="flex items-center gap-2 text-[14px] text-ink">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-accent"
        />
        Anonym teilen
      </label>

      {error && <p className="text-sm text-warn">{error}</p>}

      <button type="submit" disabled={pending} className="btn-accent w-full py-2.5">
        {pending ? "Wird geteilt …" : "Teilen"}
      </button>
    </form>
  );
}

function SuggestionForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<"topic" | "activity">("topic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("type", type);
    fd.set("title", title);
    if (description.trim()) fd.set("description", description);
    startTransition(async () => {
      const res = await createSuggestion(fd);
      if (res?.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="label">Art des Vorschlags</p>
        <div className="flex gap-1.5">
          <SegButton active={type === "topic"} onClick={() => setType("topic")}>
            <LightbulbIcon className="h-4 w-4" /> Thema
          </SegButton>
          <SegButton active={type === "activity"} onClick={() => setType("activity")}>
            <TargetIcon className="h-4 w-4" /> Aktivität
          </SegButton>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="title">
          {type === "topic" ? "Themenvorschlag" : "Aktivitätsvorschlag"}
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="field"
          placeholder={type === "topic" ? "z. B. Wie erkenne ich Gottes Willen?" : "z. B. Lasertag"}
          maxLength={200}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Beschreibung (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="field resize-none"
          maxLength={1000}
        />
      </div>

      {error && <p className="text-sm text-warn">{error}</p>}

      <button type="submit" disabled={pending} className="btn-accent w-full py-2.5">
        {pending ? "Wird gesendet …" : "Vorschlagen"}
      </button>
    </form>
  );
}
