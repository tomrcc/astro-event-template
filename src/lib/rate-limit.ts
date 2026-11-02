// In-memory, so each server instance counts separately. Put a platform rate limit in front for real traffic.
const hits = new Map<string, number[]>();

export function rateLimited(key: string, limit: number, windowMs: number) {
	const now = Date.now();
	if (hits.size > 10_000) hits.clear();
	const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
	recent.push(now);
	hits.set(key, recent);
	return recent.length > limit;
}
