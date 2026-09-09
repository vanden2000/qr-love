import React from "react";

export function SceneLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 z-10 pointer-events-none">
      <div className="w-10 h-10 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin mb-3" />
      <span className="text-xs font-light tracking-widest text-zinc-400 uppercase animate-pulse">
        Đang mở không gian yêu thương...
      </span>
    </div>
  );
}
