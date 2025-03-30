import { clsx, type ClassValue } from "clsx"; // Ensure ClassValue is imported
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
