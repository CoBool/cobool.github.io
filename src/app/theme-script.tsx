import { THEME_STORAGE_KEY } from "./theme"

const themeScript = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const validModes = new Set(["system", "light", "dark"]);
  const parseMode = (value) => validModes.has(value) ? value : "system";
  const getStoredMode = () => parseMode(window.localStorage.getItem(storageKey));
  const resolveMode = (mode) => {
    if (mode !== "system") return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const syncButtons = (mode) => {
    document.querySelectorAll("[data-theme-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", button.getAttribute("data-theme-mode") === mode ? "true" : "false");
    });
  };
  const applyMode = (mode) => {
    const parsed = parseMode(mode);
    window.localStorage.setItem(storageKey, parsed);
    document.documentElement.classList.toggle("dark", resolveMode(parsed) === "dark");
    syncButtons(parsed);
  };
  const init = () => {
    applyMode(getStoredMode());
    document.querySelectorAll("[data-theme-mode]").forEach((button) => {
      button.addEventListener("click", () => applyMode(button.getAttribute("data-theme-mode")));
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (getStoredMode() === "system") applyMode("system");
    });
  };

  document.documentElement.classList.toggle("dark", resolveMode(getStoredMode()) === "dark");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`

export function ThemeScript() {
  return <script>{themeScript}</script>
}
