export class ApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const writing = options.method && options.method !== 'GET';
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    // Read the body while the timeout is still active.
    const body = await response.text();
    return new Response(body || null, { status: response.status, statusText: response.statusText, headers: response.headers });
  } catch (error) {
    const uncertain = writing ? ' Bitte vor erneutem Speichern prüfen, ob die Änderung bereits übernommen wurde.' : '';
    if (controller.signal.aborted) throw new ApiError('Der Server antwortet nicht rechtzeitig.' + uncertain);
    if (error instanceof TypeError) throw new ApiError('Keine Verbindung zum Server. Bitte Internetverbindung prüfen.' + uncertain);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleResponse(response: Response) {
  const text = await response.text();
  let data;
  if (text) {
    try { data = JSON.parse(text); } catch { /* handled below */ }
  }
  if (!response.ok) {
    const fallback = response.status === 401 ? 'Bitte erneut anmelden.'
      : response.status === 403 ? 'Für diese Aktion fehlt die Berechtigung.'
      : response.status === 409 ? 'Die Daten wurden bereits geändert oder der Eintrag existiert schon. Bitte den aktuellen Stand prüfen.'
      : response.status === 413 ? 'Die Datei ist zu groß. Bitte ein kleineres Bild auswählen.'
      : response.status >= 500 ? 'Serverfehler. Bitte später erneut versuchen.'
      : 'Die Anfrage konnte nicht verarbeitet werden.';
    const message = data && typeof data.message === 'string' ? data.message : fallback;
    throw new ApiError(message, response.status);
  }
  if (!text) return undefined;
  if (data === undefined) throw new ApiError('Der Server hat eine ungültige Antwort geliefert. Bitte den aktuellen Datenstand prüfen.', response.status);
  return data;
}
