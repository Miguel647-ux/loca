export { cn } from "cn"
export function getSafeRedirect(url?: string | null): string {
  if (!url) return "/dashboard";
  
  if (!url.startsWith("/") || url.startsWith("//")) {
    return "/dashboard";
  }
  if (url.includes("\\") || url.includes("://")) {
    return "/dashboard";
  }

  return url;
}