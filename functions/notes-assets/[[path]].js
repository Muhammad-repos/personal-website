const R2_BASE = "https://pub-e2c44750f274499099b8368828afa1dc.r2.dev";
const PREFIX = "notes-assets";

export async function onRequest(context) {
  const { params, next } = context;
  const segments = Array.isArray(params.path)
    ? params.path
    : [params.path].filter(Boolean);
  const key = [PREFIX, ...segments].join("/");
  try {
    const res = await fetch(`${R2_BASE}/${key}`);
    if (res.ok) {
      const headers = new Headers(res.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(res.body, { status: res.status, headers });
    }
  } catch (e) {
    // fall through to static fallback below
  }
  // R2 miss/error -> serve the static copy on Pages (if present)
  try {
    return await context.env.ASSETS.fetch(context.request);
  } catch (e) {
    return undefined;
  }
}
