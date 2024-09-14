"use client";
import React from "react";
import { Button } from "./ui/movingborder";
 

 

export function MovingBorderDemo({children}:{children:React.ReactNode}) {
  return (
    <div>
      <Button
        borderRadius="1.75rem"
        className="bg-zinc-900  border  text-white   border-neutral-800 dark:border-slate-800"
      >
        {children}
      </Button>
    </div>
  );
}
