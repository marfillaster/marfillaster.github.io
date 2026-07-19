// Browser entry for first-party comment loading, preview, and lazy Turnstile.
export { CommentsThread } from "../interactive.tsx";

const activeClasses = ["border-foreground", "text-foreground"];
const inactiveClasses = [
  "border-transparent",
  "text-muted-foreground",
  "hover:text-foreground",
];

function setTab(form: HTMLFormElement, selected: "write" | "preview") {
  const write = form.querySelector<HTMLElement>("[data-comment-write-pane]");
  const preview = form.querySelector<HTMLElement>("[data-comment-preview-pane]");
  if (!write || !preview) return;

  write.hidden = selected !== "write";
  preview.hidden = selected !== "preview";
  for (const button of form.querySelectorAll<HTMLButtonElement>(
    "[data-comment-tab]",
  )) {
    const active = button.dataset.commentTab === selected;
    button.setAttribute("aria-selected", String(active));
    button.classList.remove(...(active ? inactiveClasses : activeClasses));
    button.classList.add(...(active ? activeClasses : inactiveClasses));
  }
}

function previewParameters(form: HTMLFormElement): URLSearchParams {
  const parameters = new URLSearchParams();
  for (const [name, entry] of new FormData(form)) {
    if (typeof entry === "string") parameters.append(name, entry);
  }
  parameters.set("intent", "preview");
  return parameters;
}

async function showPreview(form: HTMLFormElement, button: HTMLButtonElement) {
  const textarea = form.elements.namedItem("body");
  const pane = form.querySelector<HTMLElement>("[data-comment-preview-pane]");
  if (!(textarea instanceof HTMLTextAreaElement) || !pane) return;

  setTab(form, "preview");
  const draft = textarea.value;
  if (!draft.trim()) {
    pane.replaceChildren(document.createTextNode("Nothing to preview"));
    pane.className = "min-h-36 py-3 text-sm text-muted-foreground";
    pane.dataset.previewDraft = draft;
    return;
  }
  if (pane.dataset.previewDraft === draft) return;

  button.disabled = true;
  pane.setAttribute("aria-busy", "true");
  pane.replaceChildren(document.createTextNode("Rendering…"));
  pane.className = "min-h-36 py-3 text-sm text-muted-foreground";
  try {
    const url = new URL(form.action);
    url.searchParams.set("fragment", "1");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "text/html",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: previewParameters(form),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    pane.innerHTML = await response.text();
    pane.className = "min-h-36 py-3";
    pane.dataset.previewDraft = draft;
  } catch (error) {
    pane.replaceChildren(document.createTextNode("Preview unavailable"));
    pane.className = "min-h-36 py-3 text-sm text-muted-foreground";
    console.error("Comment preview unavailable", error);
  } finally {
    button.disabled = false;
    pane.removeAttribute("aria-busy");
  }
}

document.addEventListener("click", (event) => {
  const button = (event.target as Element | null)?.closest?.(
    "button[data-comment-tab]",
  ) as HTMLButtonElement | null;
  const form = button?.closest<HTMLFormElement>("form[data-comment-composer]");
  if (!button || !form) return;

  if (button.dataset.commentTab === "preview") {
    void showPreview(form, button);
  } else {
    setTab(form, "write");
  }
});
