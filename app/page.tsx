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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const gradient = useMemo(() => buildWheelGradient(entries), [entries]);
  const sliceAngle = useMemo(() => (entries.length > 0 ? 360 / entries.length : 0), [entries.length]);
  const baseAngleOffset = -90;

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
    const slice = 360 / entries.length;
    const winnerIndex = Math.floor(Math.random() * entries.length);
    const pointerAngle = 90; // Pointer is positioned on the right side of the wheel
    const winnerAngle = winnerIndex * slice + slice / 2;
    const additionalRotation = turns * 360;
    const targetRotation = rotation - additionalRotation + (pointerAngle - winnerAngle);

    setIsSpinning(true);
    setSelectedIndex(null);
    setShowWinnerModal(false);
    setRotation((prevRotation) => prevRotation - additionalRotation + (pointerAngle - winnerAngle));

    const durationMs = 4500;
    window.setTimeout(() => {
      setSelectedIndex(winnerIndex);
      setIsSpinning(false);

      setTimeout(() => {
        setShowWinnerModal(true);
      }, 500);
    }, durationMs);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeModal = () => {
    setShowWinnerModal(false);
  };

  return (
    <>
    <main className={`page ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {!isFullscreen && (
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
      )}

      <section className={`wheel-panel ${isFullscreen ? 'fullscreen-wheel' : ''}`}>
        {!isFullscreen && (
          <button 
            className="fullscreen-toggle" 
            onClick={toggleFullscreen}
            type="button"
            title="Enter fullscreen"
          >
            ⛶
          </button>
        )}
        
        <div className="wheel-wrapper">
          <div className="pointer-right" aria-hidden />
          <div
            className="wheel"
            style={{
              backgroundImage: gradient,
              transform: `rotate(${rotation}deg)`
            }}
          >
            <div className="wheel-segments" aria-hidden>
              {entries.map((entry, index) => {
                const centerAngle = baseAngleOffset + index * sliceAngle + sliceAngle / 2;
                return (
                  <div
                    key={entry}
                    className="wheel-segment"
                    style={{ 
                      transform: `rotate(${centerAngle}deg)`
                    }}
                  >
                    <span 
                      className="wheel-label"
                    >
                      {entry}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="wheel-center"
            onClick={handleSpin}
            disabled={entries.length === 0 || isSpinning}
          >
            {isSpinning ? "..." : "Spin"}
          </button>
        </div>
        
        {isFullscreen && (
          <button 
            className="fullscreen-exit" 
            onClick={toggleFullscreen}
            type="button"
            title="Exit fullscreen"
          >
            Exit Fullscreen
          </button>
        )}
        
        {!isFullscreen && (
          <>
            <button className="spin-button" type="button" onClick={handleSpin} disabled={entries.length === 0 || isSpinning}>
              {isSpinning ? "Spinning..." : "Spin!"}
            </button>
            {selectedIndex !== null && entries[selectedIndex] && (
              <div className="result" role="status">
                <span>Winner:</span>
                <strong>{entries[selectedIndex]}</strong>
              </div>
            )}
          </>
        )}
      </section>
    </main>

    {showWinnerModal && selectedIndex !== null && entries[selectedIndex] && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal} type="button">✕</button>
          <div className="modal-icon">🎉</div>
          <h2 className="modal-title">Winner!</h2>
          <div className="modal-winner">{entries[selectedIndex]}</div>
          <button className="modal-button" onClick={closeModal} type="button">
            Close
          </button>
        </div>
      </div>
    )}
    </>
  );
}