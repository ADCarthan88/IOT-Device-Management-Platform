type RequestOptions = RequestInit & { timeoutMs?: number };

async function parseJsonSafe<T>(res: Response): Promise<T | undefined> {
  if (res.status === 204) return undefined;
  const contentType = res.headers.get("content-type") || "";
  const hasBody =
    res.headers.get("content-length") !== "0" &&
    ![101, 204, 205, 304].includes(res.status);

  if (!hasBody) return undefined;
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  // Fallback: return text if not JSON
  const text = await res.text();
  return text as unknown as T;
}

async function makeRequest<T = any>(
  method: string,
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  const { timeoutMs = 10000, headers, ...rest } = options ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(headers as Record<string, string> | undefined)
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      signal: controller.signal,
      ...rest
    });

    if (!response.ok) {
      // Try to include response body in error for easier debugging
      let body: string | undefined;
      try {
        body = await response.text();
      } catch {
        body = undefined;
      }
      const message = `HTTP ${response.status} ${response.statusText}${
        body ? ` - ${body}` : ""
      }`;
      const err = new Error(message) as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    const parsed = await parseJsonSafe<T>(response);
    return parsed as T;
  } finally {
    clearTimeout(timer);
  }
}

export const get = <T = any>(url: string, options?: RequestOptions) =>
  makeRequest<T>("GET", url, undefined, options);

export const post = <T = any>(url: string, data: any, options?: RequestOptions) =>
  makeRequest<T>("POST", url, data, options);

export const put = <T = any>(url: string, data: any, options?: RequestOptions) =>
  makeRequest<T>("PUT", url, data, options);

export const del = <T = any>(url: string, options?: RequestOptions) =>
  makeRequest<T>("DELETE", url, undefined, options);