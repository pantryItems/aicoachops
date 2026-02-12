const GHL_BASE = 'https://services.leadconnectorhq.com';

interface GHLRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: Record<string, unknown>;
  apiKey: string;
}

export async function ghlRequest<T = unknown>({
  method,
  path,
  body,
  apiKey,
}: GHLRequestOptions): Promise<T> {
  const response = await fetch(`${GHL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (response.status === 429) {
    // Rate limited — wait and retry
    const retryAfter = response.headers.get('retry-after') || '10';
    await new Promise((resolve) => setTimeout(resolve, parseInt(retryAfter) * 1000));
    return ghlRequest({ method, path, body, apiKey });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL API ${method} ${path}: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Validate a private integration API key by fetching locations
export async function validateApiKey(apiKey: string): Promise<{ locationId: string; name: string } | null> {
  try {
    const data = await ghlRequest<{ locations: Array<{ id: string; name: string }> }>({
      method: 'GET',
      path: '/locations/search',
      apiKey,
    });

    if (data.locations && data.locations.length > 0) {
      return { locationId: data.locations[0].id, name: data.locations[0].name };
    }
    return null;
  } catch {
    return null;
  }
}
