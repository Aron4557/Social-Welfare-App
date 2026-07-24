import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const viteEntry = join(root, "node_modules", "vite", "bin", "vite.js");
const children = [];

function start(args, environment = process.env) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) {
      for (const running of children) {
        if (!running.killed) running.kill();
      }
      process.exitCode = code;
    }
  });
}

start(["server.mjs"], { ...process.env, PORT: "4174" });
start([viteEntry]);

function stop() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
