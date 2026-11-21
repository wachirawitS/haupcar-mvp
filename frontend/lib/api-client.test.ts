import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api-client";
import { ApiError, NETWORK_ERROR } from "./api-error";
import { clearToken, getToken } from "./auth-token";

vi.mock("./auth-token", () => ({
  getToken: vi.fn(() => null),
  clearToken: vi.fn(),
}));

const clearCache = vi.fn();
vi.mock("./query-client", () => ({
  getQueryClient: () => ({ clear: clearCache }),
}));

const fetchMock = vi.fn<typeof fetch>();
const assignMock = vi.fn();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function lastRequest(): { url: string; init: RequestInit } {
  const call = fetchMock.mock.calls.at(-1);
  if (!call) throw new Error("fetch was not called");
  return { url: String(call[0]), init: call[1] ?? {} };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { location: { assign: assignMock } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("apiRequest", () => {
  it("builds the URL from NEXT_PUBLIC_API_URL and skips empty query values", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await apiRequest("/cars", { query: { page: 2, search: "", limit: undefined } });

    expect(lastRequest().url).toBe("http://localhost:4000/api/v1/cars?page=2");
  });

  it("attaches the bearer token when one is stored", async () => {
    vi.mocked(getToken).mockReturnValueOnce("abc");
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiRequest("/cars");

    const headers = new Headers(lastRequest().init.headers);
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });

  it("sends JSON bodies with a JSON content type", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}));

    await apiRequest("/cars", { method: "POST", body: { brand: "Toyota" } });

    const { init } = lastRequest();
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(init.body).toBe('{"brand":"Toyota"}');
  });

  it("does not force a content type for FormData", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}));
    const form = new FormData();

    await apiRequest("/cars/1/images", { method: "POST", body: form });

    const { init } = lastRequest();
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
    expect(init.body).toBe(form);
  });

  it("returns undefined for 204 without parsing JSON", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiRequest("/cars/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("throws a typed ApiError from the backend error body", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, { statusCode: 409, code: "CAR_PLATE_EXISTS", message: "Duplicate" }),
    );

    await expect(apiRequest("/cars", { method: "POST", body: {} })).rejects.toMatchObject({
      statusCode: 409,
      code: "CAR_PLATE_EXISTS",
    });
  });

  it("throws NETWORK_ERROR when the request cannot reach the API", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await apiRequest("/cars").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe(NETWORK_ERROR);
  });

  it("on 401 clears the token and cache, then redirects to /login", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { statusCode: 401, code: "UNAUTHORIZED", message: "Unauthorized" }),
    );

    await expect(apiRequest("/cars")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(clearToken).toHaveBeenCalled();
    expect(clearCache).toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledWith("/login");
  });

  it("does not redirect on 401 when skipAuthRedirect is set (login)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { statusCode: 401, code: "INVALID_CREDENTIALS", message: "Invalid" }),
    );

    await expect(
      apiRequest("/auth/login", { method: "POST", body: {}, skipAuthRedirect: true }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(assignMock).not.toHaveBeenCalled();
    expect(clearToken).not.toHaveBeenCalled();
  });
});
