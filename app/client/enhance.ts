// Framework-free progressive enhancement over the server-rendered page:
//   - code-copy buttons (clipboard over the Shiki-rendered <figure> blocks)
//   - legacy hash redirects (fragments never reach the server, so these must
//     stay client-side even under SSR)
// Precompiled to /assets/entries/enhance.js by scripts/build-remix-assets.mjs.

// --- Code copy (port of src/components/code-copy.tsx, event-delegated) ------

const copyTimeouts = new WeakMap<HTMLButtonElement, number>();

async function copyCode(button: HTMLButtonElement) {
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
  window.clearTimeout(copyTimeouts.get(button));
  copyTimeouts.set(
    button,
    window.setTimeout(() => button.classList.remove("copied"), 1400),
  );
}

document.addEventListener("click", (event) => {
  const button = (event.target as Element | null)?.closest?.(
    "button.code-copy",
  ) as HTMLButtonElement | null;
  if (button) {
    void copyCode(button);
  }
});

// --- Legacy hash redirects (port of HashRedirects in src/lib/post-route.tsx) --

interface HashRedirect {
  exact?: string;
  prefix?: string;
  toPath: string;
}

function applyHashRedirects() {
  const config = document.getElementById("hash-redirects");
  if (!config?.textContent) {
    return;
  }

  let redirects: HashRedirect[];
  try {
    redirects = JSON.parse(config.textContent);
  } catch {
    return;
  }

  const hash = window.location.hash.replace(/^#/, "");
  const redirect = redirects.find(
    (candidate) =>
      (candidate.exact && hash === candidate.exact) ||
      (candidate.prefix && hash.startsWith(candidate.prefix)),
  );

  if (!redirect) {
    return;
  }

  const targetHash = redirect.exact === hash ? "" : window.location.hash;
  window.location.replace(`${redirect.toPath}${targetHash}`);
}

applyHashRedirects();
