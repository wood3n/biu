import { describe, it, expect, vi, beforeEach } from "vitest";

import { DownloadCore } from "../electron/ipc/download/download-core";
import { DownloadStatus, FileType, DownloadTask } from "../electron/ipc/download/types";

const mocks = vi.hoisted(() => {
  const on = vi.fn();
  const writeStream = {
    on,
    write: vi.fn(),
    end: vi.fn(),
    destroy: vi.fn(),
    once: vi.fn(),
  };
  return { writeStream };
});

// Mocks need to be defined inside vi.mock or use hoisted variables
vi.mock("got", () => {
  const mockGotHead = vi.fn();
  const mockGotStream = vi.fn();
  return {
    default: {
      head: mockGotHead,
      stream: mockGotStream,
    },
  };
});

vi.mock("fluent-ffmpeg", () => {
  const mockChain: any = {
    format: vi.fn(() => mockChain),
    audioCodec: vi.fn(() => mockChain),
    videoCodec: vi.fn(() => mockChain),
    on: vi.fn((event, cb) => {
      if (event === "end") setTimeout(cb, 10);
      return mockChain;
    }),
    save: vi.fn(),
  };

  return {
    default: vi.fn(() => mockChain),
  };
});

vi.mock("electron-log", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock fs
vi.mock("fs", async () => {
  const createWriteStream = vi.fn(() => mocks.writeStream);

  const mockFs = {
    createWriteStream,
    existsSync: vi.fn().mockReturnValue(false),
    mkdirSync: vi.fn(),
    rmSync: vi.fn(),
    unlinkSync: vi.fn(),
    promises: {
      readFile: vi.fn().mockResolvedValue(Buffer.from("test")),
      stat: vi.fn().mockResolvedValue({ size: 100 }),
    },
    statSync: vi.fn().mockReturnValue({ size: 100 }),
  };

  return {
    ...mockFs,
    default: mockFs,
  };
});

// Mock stream/promises
vi.mock("stream/promises", () => ({
  pipeline: vi.fn().mockResolvedValue(undefined),
}));

import fs from "fs";
// Import mocked modules to control them in tests
import got from "got";
import { pipeline } from "stream/promises";

describe("DownloadCore", () => {
  let task: DownloadTask;

  beforeEach(() => {
    // ... setup ...
    (pipeline as any).mockResolvedValue(undefined); // Reset pipeline mock
    task = {
      id: "test-id",
      options: {
        url: "http://test.com/file",
        savePath: "/tmp",
        fileName: "test.mp3",
        fileType: FileType.MP3,
        referer: "http://ref.com",
      },
      status: DownloadStatus.WAITING,
      progress: { totalBytes: 0, downloadedBytes: 0, percent: 0, speed: 0, eta: 0 },
      createdTime: Date.now(),
      updatedTime: Date.now(),
      retryCount: 0,
    };

    vi.clearAllMocks();

    // Setup default behavior for writeStream.on
    mocks.writeStream.on.mockImplementation((event: any, cb: any) => {
      if (event === "finish") {
        // Use process.nextTick to simulate async
        process.nextTick(cb);
      }
      return mocks.writeStream;
    });
  });

  it("should download small file directly", async () => {
    // Setup mock return values
    (got.head as any).mockResolvedValue({ headers: { "content-length": "1000" } });
    (got.stream as any).mockReturnValue({
      on: vi.fn().mockImplementation((event, cb) => {
        if (event === "downloadProgress") {
          // simulate progress
        }
        return {
          pipe: vi.fn(), // not used in pipeline mock but good to have
        };
      }),
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from("data");
      },
    });

    const core = new DownloadCore(task);
    await core.start();

    expect(task.status).toBe(DownloadStatus.COMPLETED);
    expect(got.head).toHaveBeenCalled();
  });

  it("should use chunked strategy for large files", async () => {
    (got.head as any).mockResolvedValue({ headers: { "content-length": "30000000" } }); // 30MB
    (got.stream as any).mockReturnValue({
      on: vi.fn(),
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from("chunk");
      },
    });

    const core = new DownloadCore(task);
    await core.start();

    expect(task.status).toBe(DownloadStatus.COMPLETED);
    // 3 chunks (10MB each for 30MB)
    expect(got.stream).toHaveBeenCalledTimes(3); // 1 for direct check (if applicable) or chunks.
    // In code:
    // 1. getContentLength (got.head)
    // 2. downloadChunked -> loops 3 times -> calls downloadChunk -> calls got.stream
    // Wait, downloadDirect calls got.stream too.
    // If chunked, downloadDirect is NOT called.
    // So 3 calls to got.stream.

    // Actually, checking call count might be flaky if implementation changes slightly.
    // But for 30MB / 10MB chunk = 3 chunks.
    expect((got.stream as any).mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it("should cancel download", async () => {
    (got.head as any).mockResolvedValue({ headers: { "content-length": "1000" } });

    let rejectPipeline: any;
    (pipeline as any).mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          rejectPipeline = reject;
        }),
    );

    // Mock a stream
    (got.stream as any).mockReturnValue({
      on: vi.fn(),
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from("data");
      },
    });

    const core = new DownloadCore(task);
    // Set tempPath explicitly to ensure cleanup logic has a path to operate on
    task.tempPath = "/tmp/.temp/test-id/source.tmp";

    // Prevent crash on error
    core.on("error", () => { });

    const startPromise = core.start();

    // Wait for start to progress to pipeline
    await new Promise(r => setTimeout(r, 10));

    // Ensure existsSync returns true for cleanup
    (fs.existsSync as any).mockReturnValue(true);

    // Cancel
    core.cancel();

    // Simulate pipeline failure due to abort
    if (rejectPipeline) {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      rejectPipeline(abortError);
    } else {
      throw new Error("Pipeline was not called");
    }

    await startPromise;

    expect(task.status).toBe(DownloadStatus.CANCELLED);
    expect(fs.rmSync).toHaveBeenCalled();
  });

  it("should handle download error", async () => {
    (got.head as any).mockResolvedValue({ headers: { "content-length": "1000" } });

    // Mock pipeline failure
    (pipeline as any).mockRejectedValue(new Error("Network Error"));

    // Mock stream
    (got.stream as any).mockReturnValue({
      on: vi.fn(),
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from("data");
      },
    });

    const core = new DownloadCore(task);
    // Prevent crash on error
    core.on("error", () => { });

    await core.start();

    expect(task.status).toBe(DownloadStatus.ERROR);
    expect(task.error?.message).toBe("Network Error");
  });
});
