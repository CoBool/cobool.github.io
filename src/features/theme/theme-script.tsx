import { THEME_MODES, THEME_STORAGE_KEY } from "./theme"

// 유효 모드 목록을 THEME_MODES 에서 직렬화해, 모듈 쪽 정의가 바뀌면
// 부트스트랩 스크립트도 자동으로 따라가게 한다.
const themeScript = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const validModes = new Set(${JSON.stringify(THEME_MODES)});
  const parseMode = (value) => validModes.has(value) ? value : "system";
  const getStoredMode = () => parseMode(window.localStorage.getItem(storageKey));
  const resolveMode = (mode) => {
    if (mode !== "system") return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const applyMode = (mode) => {
    const parsed = parseMode(mode);
    window.localStorage.setItem(storageKey, parsed);
    document.documentElement.classList.toggle("dark", resolveMode(parsed) === "dark");
  };
  const init = () => {
    applyMode(getStoredMode());
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
