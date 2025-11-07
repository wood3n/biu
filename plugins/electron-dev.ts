import { logger } from "@rsbuild/core";
import electron from "electron";
import * as childProcess from "node:child_process";

export function startElectronDev() {
  // @ts-expect-error electron type not match string
  const electronProcess: childProcess.ChildProcessWithoutNullStreams = childProcess.spawn(electron, ["."], {
    stdio: "inherit",
    windowsHide: false,
  });

  electronProcess.on("spawn", () => {
    logger.success("Start electron successfully!");
  });

  electronProcess.on("error", (err: unknown) => {
    logger.error("Failed to start electron process", err);
  });

  electronProcess.on("close", (code: number, signal: unknown) => {
    if (code === null) {
      logger.error("exited with signal", signal);
      process.exit(1);
    }
    process.exit(code);
  });

  const handleTerminationSignal = (signal: any) => {
    process.on(signal, () => {
      if (!electronProcess.killed) {
        electronProcess.kill(signal);
      }
    });
  };

  handleTerminationSignal("SIGINT");
  handleTerminationSignal("SIGTERM");
}
