// Clipboard writes fail outright on insecure origins (http:// LAN hosts, file://),
// where navigator.clipboard is undefined, and when the page lacks focus.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
