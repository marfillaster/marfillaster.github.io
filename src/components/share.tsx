import { Check, Facebook, Link2, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";

/**
 * Lightweight social share row. No third-party scripts or trackers — just
 * intent URLs opened in a new tab, plus a copy-to-clipboard button.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const targets = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      Icon: Twitter,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      Icon: Facebook,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      Icon: Linkedin,
    },
  ] as const;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="not-prose mt-12 flex items-center gap-4 border-t pt-6">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Share
      </span>
      <div className="flex items-center gap-1">
        {targets.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="rounded-md p-2 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Link copied" : "Copy link"}
          className="rounded-md p-2 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
