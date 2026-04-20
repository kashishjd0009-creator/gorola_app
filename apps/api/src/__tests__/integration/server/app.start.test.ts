import { afterEach, describe, expect, it, vi } from "vitest";

const { listenMock, createServerMock } = vi.hoisted(() => {
  const listen = vi.fn();
  const createServer = vi.fn(() => ({
    listen
  }));

  return {
    listenMock: listen,
    createServerMock: createServer
  };
});

vi.mock("../../../config/env.js", () => ({}));
vi.mock("../../../server.js", () => ({
  createServer: createServerMock
}));

import { startApp } from "../../../app.js";

describe("startApp", () => {
  afterEach(() => {
    listenMock.mockReset();
    createServerMock.mockClear();
    delete process.env.PORT;
    delete process.env.HOST;
  });

  it("starts listening with configured host and numeric port", async () => {
    process.env.PORT = "4010";
    process.env.HOST = "127.0.0.1";
    listenMock.mockResolvedValueOnce(undefined);

    await startApp();

    expect(createServerMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith({
      port: 4010,
      host: "127.0.0.1"
    });
  });
});
