export type MarkKind = "keep" | "drop" | "add";

export type Mark = {
  kind: MarkKind;
  word: string;
};

function tokens(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

// Match on letters and digits only: punctuation and case are presentation,
// not word changes, so they must not strike a word the rewrite keeps.
function key(w: string): string {
  const k = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return k.length > 0 ? k : w.toLowerCase();
}

export function wordDiff(spoken: string, send: string): {
  left: Mark[];
  right: Mark[];
} {
  const a = tokens(spoken);
  const b = tokens(send);
  const ka = a.map(key);
  const kb = b.map(key);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array<number>(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        ka[i - 1] === kb[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const left: Mark[] = [];
  const right: Mark[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (ka[i - 1] === kb[j - 1]) {
      left.push({ kind: "keep", word: a[i - 1] });
      right.push({ kind: "keep", word: b[j - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      left.push({ kind: "drop", word: a[i - 1] });
      i--;
    } else {
      right.push({ kind: "add", word: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    left.push({ kind: "drop", word: a[--i] });
  }
  while (j > 0) {
    right.push({ kind: "add", word: b[--j] });
  }
  left.reverse();
  right.reverse();
  return { left, right };
}

export function droppedCount(marks: Mark[]): number {
  return marks.filter((m) => m.kind === "drop").length;
}

export function addedCount(marks: Mark[]): number {
  return marks.filter((m) => m.kind === "add").length;
}
