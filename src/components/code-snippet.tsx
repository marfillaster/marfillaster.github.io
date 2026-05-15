import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import ini from "react-syntax-highlighter/dist/esm/languages/prism/ini";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "./ui/button";

type CodeSnippetProps = {
  code: string;
  language: string;
  label: string;
};

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("ini", ini);
SyntaxHighlighter.registerLanguage("javascript", javascript);

function useDocumentDarkMode() {
  const [dark, setDark] = useState(() =>
    typeof document === "undefined" ? false : document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return dark;
}

export function CodeSnippet({ code, language, label }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const dark = useDocumentDarkMode();

  async function copyCode() {
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

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <figure className="not-prose overflow-hidden rounded-lg border bg-card shadow-sm">
      <figcaption className="flex min-h-12 items-center justify-between gap-3 border-b bg-muted/50 px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{language}</p>
        </div>
        <Button
          aria-label={copied ? "Copied code" : `Copy ${label}`}
          className="shrink-0"
          onClick={copyCode}
          size="icon"
          type="button"
          variant="ghost"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </figcaption>
      <SyntaxHighlighter
        PreTag="div"
        customStyle={{
          background: "transparent",
          fontSize: "0.8125rem",
          lineHeight: "1.65",
          margin: 0,
          padding: "1rem",
          overflowX: "auto",
        }}
        codeTagProps={{
          className: "font-mono",
        }}
        language={language}
        showLineNumbers
        style={dark ? oneDark : oneLight}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </figure>
  );
}
