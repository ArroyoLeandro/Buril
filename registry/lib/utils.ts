import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names and resolve Tailwind conflicts (the last conflicting class wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
