"use client";

import Image from "next/image";
import { useState } from "react";

const frame = "group relative block size-48 overflow-hidden rounded-lg border border-border sm:size-64";
const layer = "absolute inset-0 size-full object-cover";

export function AvatarSwap({ src, alt, altSrc }: { src: string; alt: string; altSrc?: string }) {
  const [swapped, setSwapped] = useState(false);
  const photo = <Image src={src} alt={alt} width={397} height={397} loading="eager" fetchPriority="high" className={layer} />;
  if (!altSrc) return <div className={frame}>{photo}</div>;
  return (
    <button
      type="button"
      onClick={() => setSwapped((value) => !value)}
      aria-pressed={swapped}
      className={`${frame} focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2`}
    >
      {photo}
      <Image
        src={altSrc}
        alt=""
        width={397}
        height={397}
        className={`${layer} opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${swapped ? "opacity-100" : ""}`}
      />
    </button>
  );
}
