import { useEffect, useState } from "react";

interface PageStats {
  views: number;
  activeUsers: number;
}

function formatViews(views: number): string {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(views >= 10_000 ? 0 : 1)}k`;
  }
  return String(views);
}

export function PageStats({ path, title }: { path: string; title: string }) {
  const [stats, setStats] = useState<PageStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const query = new URLSearchParams({ path, title });
    fetch(`/api/analytics/pageviews?${query}`)
      .then((res) => (res.ok ? (res.json() as Promise<PageStats>) : null))
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {
        // Analytics is decorative — a failed fetch just means nothing renders.
      });

    return () => {
      cancelled = true;
    };
  }, [path, title]);

  if (!stats) return null;

  return (
    <span>
      {" · "}
      {formatViews(stats.views)} views
      {stats.activeUsers > 0 ? ` · ${stats.activeUsers} reading now` : null}
    </span>
  );
}
