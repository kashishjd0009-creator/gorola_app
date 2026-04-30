import { afterEach, describe, expect, it, vi } from "vitest";

const { listenMock, createServerMock, closeMock } = vi.hoisted(() => {
  const listen = vi.fn();
  const close = vi.fn().mockResolvedValue(undefined);
  const createServer = vi.fn(() => ({
    close,
    listen
  }));

  return {
    closeMock: close,
    listenMock: listen,
    createServerMock: createServer
  };
});

vi.mock("../../../config/env.js", () => ({}));
vi.mock("../../../lib/telemetry.js", () => ({
  shutdownTelemetry: vi.fn().mockResolvedValue(undefined),
  startTelemetry: vi.fn().mockResolvedValue(undefined)
}));

const { warmupMock } = vi.hoisted(() => ({
  warmupMock: vi.fn().mockResolvedValue(undefined)
}));
vi.mock("../../../lib/server-warmup.js", () => ({
  warmupExternalConnections: warmupMock
}));

vi.mock("../../../server.js", () => ({
  createServer: createServerMock
}));

import { startApp } from "../../../app.js";

describe("startApp", () => {
  afterEach(() => {
    listenMock.mockReset();
    closeMock.mockReset();
    createServerMock.mockClear();
    warmupMock.mockClear();
    delete process.env.PORT;
    delete process.env.HOST;
  });

  it("starts listening with configured host and numeric port", async () => {
    process.env.PORT = "4010";
    process.env.HOST = "127.0.0.1";
    listenMock.mockResolvedValueOnce(undefined);

    await startApp();

    expect(warmupMock).toHaveBeenCalledTimes(1);
    expect(createServerMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith({
      port: 4010,
      host: "127.0.0.1"
    });
  });
});
