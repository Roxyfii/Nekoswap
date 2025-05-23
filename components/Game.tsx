"use client";

import { useState } from "react";

const nekoImages = [
  { src: "/images/IDRT.png", alt: "Neko 1" },
  { src: "/images/WBNB.png", alt: "Neko 2" },
  { src: "/images/IDRX.png", alt: "Neko 3" },
  { src: "/images/Solana.png", alt: "Neko 4" },
  { src: "/images/Zerogic.png", alt: "Neko 5" },
];

const wild = { src: "/images/logo.png", alt: "Wild Neko" };

type SlotItem = {
  src: string;
  alt: string;
};

const ROWS = 3;
const COLS = 4;

function getRandomSlotItem(): SlotItem {
  if (Math.random() < 0.05) return wild; // 5% chance wild
  return nekoImages[Math.floor(Math.random() * nekoImages.length)];
}

function generateSpinGrid(): SlotItem[][] {
  const grid: SlotItem[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const rowSlots: SlotItem[] = [];
    for (let c = 0; c < COLS; c++) {
      rowSlots.push(getRandomSlotItem());
    }
    grid.push(rowSlots);
  }
  return grid;
}

export default function SlotGame() {
  const [grid, setGrid] = useState<SlotItem[][]>(generateSpinGrid());
  const [spinning, setSpinning] = useState(false);
  const [animatingSlots, setAnimatingSlots] = useState(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(false))
  );

  const slotSize = 80;

  const spinColumns = () => {
    if (spinning) return;
    setSpinning(true);

    const spinsCount = 20;
    const spinDelay = 80;

    let currentSpin = 0;

    const interval = setInterval(() => {
      setAnimatingSlots(
        Array(ROWS)
          .fill(null)
          .map(() => Array(COLS).fill(true))
      );

      setTimeout(() => {
        setGrid((prevGrid) => {
          const newGrid: SlotItem[][] = [];

          for (let r = 0; r < ROWS; r++) {
            newGrid[r] = [];
            for (let c = 0; c < COLS; c++) {
              const fromRow = (r - 1 + ROWS) % ROWS;
              newGrid[r][c] = prevGrid[fromRow][c];
            }
          }

          for (let c = 0; c < COLS; c++) {
            newGrid[0][c] = getRandomSlotItem();
          }

          return newGrid;
        });
        setAnimatingSlots(
          Array(ROWS)
            .fill(null)
            .map(() => Array(COLS).fill(false))
        );
      }, 300);

      currentSpin++;
      if (currentSpin >= spinsCount) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, spinDelay);
  };

  return (
    <div style={{paddingBottom: "100px", backgroundColor: "none", }}>
      <div
        style={{
          margin: "20px auto",
          maxWidth: `${COLS * (slotSize + 10)}px`,
          padding: 10,
          backgroundColor: "#fff0f6",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(236,72,153,0.2)",
          userSelect: "none",
          
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gridTemplateColumns: `repeat(${COLS}, ${slotSize}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${slotSize}px)`,
            gap: 5,
            backgroundColor: "none",
            justifyContent: "center",
            
          }}
        >
          {grid.flatMap((row, rIdx) =>
            row.map((item, cIdx) => {
              const isAnimating = animatingSlots[rIdx][cIdx];
              return (
                <div
                  key={`${rIdx}-${cIdx}-${item.src}`}
                  style={{
                    width: slotSize,
                    height: slotSize,
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    // animasi goyang halus
                    animation: isAnimating ? "shake 0.4s ease-in-out infinite" : "none",
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      width: "70%",
                      height: "70%",
                      objectFit: "contain",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={spinColumns}
          disabled={spinning}
          style={{
            backgroundColor: spinning ? "#aaa" : "#ec4899",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "14px 36px",
            cursor: spinning ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: 18,
            userSelect: "none",
            boxShadow: "0 6px 15px rgba(236,72,153,0.6)",
            transition: "background-color 0.3s",
          }}
        >
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>

      {/* Animasi CSS untuk goyang */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-2deg); }
          50% { transform: translateX(4px) rotate(2deg); }
          75% { transform: translateX(-4px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}
