import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isCreditTransaction(type: string) {
  const creditTypes = ['deposit', 'transfer_in', 'credit'];
  return creditTypes.includes(type.toLowerCase());
}
