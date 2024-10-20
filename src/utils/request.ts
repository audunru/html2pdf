interface DownloadRequest {
  html: string;
}

const isString = (string: unknown): boolean =>
  typeof string === "string" || string instanceof String;

export const isDownloadRequest = (body: unknown): body is DownloadRequest => {
  return isString((body as DownloadRequest).html);
};

type ParseResult<T> =
  | { parsed: T; hasError: false; error?: undefined }
  | { parsed?: undefined; hasError: true; error?: unknown };

export const safeJsonParse =
  <T>(guard: (o: unknown) => o is T) =>
  (text: string): ParseResult<T> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(text);

      return guard(parsed) ? { parsed, hasError: false } : { hasError: true };
    } catch (error) {
      return { hasError: true, error };
    }
  };
