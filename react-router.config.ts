import type { Config } from "@react-router/dev/config";
import { copyFile } from "node:fs/promises";

export default {
  appDirectory: "src",
  buildEnd: async () => {
    await copyFile("build/client/__spa-fallback.html", "build/client/404.html");
  },
  prerender: true,
  ssr: false,
} satisfies Config;
