import { useEffect } from "react";

/**
 * Progressive enhancement over the server-rendered code blocks: the markdown
 * renderer emits a <button class="code-copy"> in each figure's header; this
 * hook wires it to the clipboard. Copies the sibling <pre>'s text.
 */
export function useCodeCopy(deps: unknown[] = []) {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const button of document.querySelectorAll<HTMLButtonElement>("button.code-copy")) {
      let timeout: number | undefined;

      const onClick = async () => {
        const code = button.closest("figure")?.querySelector("pre")?.textContent ?? "";

        try {
          await navigator.clipboard.writeText(code);
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = code;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }

        button.classList.add("copied");
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => button.classList.remove("copied"), 1400);
      };

      button.addEventListener("click", onClick);
      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        window.clearTimeout(timeout);
      });
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
