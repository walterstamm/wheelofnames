"use client";

import { FormEvent, useMemo, useState } from "react";

const DEFAULT_NAMES = ["Alice", "Brandon", "Charlotte", "Dylan"];

function getSegmentColor(index: number): string {
  const hue = Math.round((index * 137.508) % 360);
  return `hsl(${hue} 85% 55%)`;
}

function buildWheelGradient(entries: string[]): string {
  if (entries.length === 0) {
    return "conic-gradient(from -90deg, #1e293b 0deg 360deg)";
  }

  const slice = 360 / entries.length;
  const segments = entries.map((_, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    const color = getSegmentColor(index);
    return `${color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(from -90deg, ${segments.join(", ")})`;
}

export default function HomePage() {
  const [entries, setEntries] = useState<string[]>(DEFAULT_NAMES);
  const [nameInput, setNameInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const gradient = useMemo(() => buildWheelGradient(entries), [entries]);

  const handleAddSingle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = nameInput.trim();
    if (!value) return;
    setEntries((prev) => {
      if (prev.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
        return prev;
      }
      return [...prev, value];
    });
    setNameInput("");
  };

  const handleBulkImport = () => {
    const raw = bulkInput
      .split(/[\n,]+/)
      .map((piece) => piece.trim())
      .filter(Boolean);

    if (raw.length === 0) {
      return;
    }

    setEntries((prev) => {
      const lowerExisting = new Set(prev.map((value) => value.toLowerCase()));
      const toAdd: string[] = [];
      for (const candidate of raw) {
        const key = candidate.toLowerCase();
        if (!lowerExisting.has(key)) {
          lowerExisting.add(key);
          toAdd.push(candidate);
        }
      }
      if (toAdd.length === 0) {
        return prev;
      }
      return [...prev, ...toAdd];
    });
    setBulkInput("");
  };

  const handleRemove = (value: string) => {
    setEntries((prev) => prev.filter((entry) => entry !== value));
  };

  const handleSpin = () => {
    if (entries.length === 0 || isSpinning) {
      return;
    }

    const turns = 5 + Math.random() * 4;
    const additionalRotation = turns * 360;
    const targetRotation = rotation + additionalRotation;

    setIsSpinning(true);
    setSelectedIndex(null);
    setRotation(targetRotation);

    const durationMs = 4500;
    window.setTimeout(() => {
      const normalized = ((targetRotation % 360) + 360) % 360;
      const slice = 360 / entries.length;
      const winningAngle = (360 - normalized + 360) % 360;
      const winner = Math.floor(winningAngle / slice) % entries.length;
      setSelectedIndex(winner);
      setIsSpinning(false);
    }, durationMs);
  };

  return (
    <main className="page">
      <section className="left-panel">
        <header>
          <h1>Cumorah Wheel</h1>
          <p>Add participants, spin the wheel, and pick a winner.</p>
        </header>

        <form className="add-form" onSubmit={handleAddSingle}>
          <label htmlFor="nameInput">Add a single participant</label>
          <div className="field-row">
            <input
              id="nameInput"
              value={nameInput}
              placeholder="e.g. Taylor"
              onChange={(event) => setNameInput(event.target.value)}
              disabled={isSpinning}
            />
            <button type="submit" disabled={!nameInput.trim() || isSpinning}>
              Add
            </button>
          </div>
        </form>

        <div className="import-box">
          <label htmlFor="bulkInput">Import multiple participants</label>
          <textarea
            id="bulkInput"
            value={bulkInput}
            rows={4}
            placeholder={"Taylor\nMorgan\nKai"}
            onChange={(event) => setBulkInput(event.target.value)}
            disabled={isSpinning}
          />
          <button type="button" onClick={handleBulkImport} disabled={bulkInput.trim().length === 0 || isSpinning}>
            Import list
          </button>
        </div>

        <div className="entries">
          <h2>Participants ({entries.length})</h2>
          {entries.length === 0 ? (
            <p className="empty">No names yet. Add a few to get started.</p>
          ) : (
            <ul>
              {entries.map((entry, index) => (
                <li key={entry}>
                  <span className="entry-info">
                    <span className="color-dot" style={{ backgroundColor: getSegmentColor(index) }} aria-hidden />
                    <span>{entry}</span>
                  </span>
                  <button type="button" onClick={() => handleRemove(entry)} disabled={isSpinning}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="wheel-panel">
        <div className="wheel-wrapper">
          <div className="pointer" aria-hidden />
          <div
            className="wheel"
            style={{
              backgroundImage: gradient,
              transform: `rotate(${rotation}deg)`
            }}
          >
            {entries.length > 0 && (
              <div className="wheel-labels" aria-hidden>
                {entries.map((entry, index) => {
                  const slice = 360 / entries.length;
                  const angle = -90 + index * slice + slice / 2;
                  const color = getSegmentColor(index);
                  return (
                    <span
                      key={entry}
                      className="wheel-label"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <span
                        className="wheel-label-text"
                        style={{ borderColor: color }}
                      >
                        {entry}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="wheel-center">Spin</div>
          </div>
        </div>
        <button className="spin-button" type="button" onClick={handleSpin} disabled={entries.length === 0 || isSpinning}>
          {isSpinning ? "Spinning..." : "Spin!"}
        </button>
        {selectedIndex !== null && entries[selectedIndex] && (
          <div className="result" role="status">
            <span>Winner:</span>
            <strong>{entries[selectedIndex]}</strong>
          </div>
        )}
      </section>
    </main>
  );
}
