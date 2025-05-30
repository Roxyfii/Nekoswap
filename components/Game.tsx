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

const ROWS = 4;
const COLS = 3;

function getRandomSlotItem(): SlotItem {
  if (Math.random() < 0.005) return wild; // 5% chance wild
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

function checkWin(grid: SlotItem[][]): { win: boolean; winningRows: number[] } {
  const winningRows: number[] = [];

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];

    const nonWild = row.find((item) => item.src !== wild.src);
    if (!nonWild) {
      winningRows.push(r);
      continue;
    }

    const isWinningRow = row.every(
      (item) => item.src === nonWild.src || item.src === wild.src
    );

    if (isWinningRow) {
      winningRows.push(r);
    }
  }

  return {
    win: winningRows.length > 0,
    winningRows,
  };
}

export default function SlotGame() {
  const [grid, setGrid] = useState<SlotItem[][]>(generateSpinGrid());
  const [spinning, setSpinning] = useState(false);
  const [animatingSlots, setAnimatingSlots] = useState(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(false))
  );
  const [winningRows, setWinningRows] = useState<number[]>([]);

  // Token Neko sementara (hilang saat refresh)
  const [tokens, setTokens] = useState<number>(0);

  const addTokens = (amount: number) => {
    setTokens((prev) => prev + amount);
  };

  const slotSize = 70;

  const spinColumns = () => {
    if (spinning) return;
    setSpinning(true);
    setWinningRows([]);

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

        setTimeout(() => {
          setGrid((currentGrid) => {
            const result = checkWin(currentGrid);
            if (result.win) {
              setWinningRows(result.winningRows);
              addTokens(result.winningRows.length);
              alert(
                `🎉 Selamat! Kamu menang di baris: ${result.winningRows
                  .map((r) => r + 1)
                  .join(", ")}\n` +
                  `Kamu mendapatkan ${result.winningRows.length} token neko!`
              );
            } else {
              setWinningRows([]);
            }
            return currentGrid;
          });
        }, 400);
      }
    }, spinDelay);
  };

  return (
    <div style={{ paddingBottom: "100px", backgroundColor: "black" }}>
      <div
        style={{
          margin: "20px auto",
          maxWidth: `${COLS * (slotSize + 10)}px`,
          padding: 10,
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(236,72,153,0.2)",
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            justifyContent: "center",
          }}
        >
          {grid.flatMap((row, rIdx) =>
            row.map((item, cIdx) => {
              const isAnimating = animatingSlots[rIdx][cIdx];
              const isWinningRow = winningRows.includes(rIdx);

              return (
                <div
                  key={`${rIdx}-${cIdx}-${item.src}`}
                  style={{
                    width: slotSize,
                    height: slotSize,
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: isWinningRow
                      ? "0 0 15px 4px rgba(236,72,153,0.8)"
                      : "0 2px 10px rgba(0,0,0,0.1)",
                    backgroundColor: isWinningRow ? "#fee" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: isAnimating ? "shake 0.4s ease-in-out infinite" : "none",
                    transition: "box-shadow 0.3s, background-color 0.3s",
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

      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          color: "white",
          fontWeight: "700",
          fontSize: 20,
          userSelect: "none",
        }}
      >
        Reward $NEKO: {tokens}
      </div>
     

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
