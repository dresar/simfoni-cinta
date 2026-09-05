import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
	const url = (process.env["UPSTASH_REDIS_REST_URL"] || "").trim();
	const token = (process.env["UPSTASH_REDIS_REST_TOKEN"] || "").trim();
	if (!url || !token) return null;
	return new Redis({ url, token });
}

export async function cached<T>(
	key: string,
	ttlSeconds: number,
	fetcher: () => Promise<T>,
): Promise<T> {
	try {
		const client = getRedis();
		if (client) {
			const hit = await client.get<T>(key).catch(() => null);
			if (hit !== null && hit !== undefined) return hit;
			const data = await fetcher();
			await client.set(key, data, { ex: ttlSeconds }).catch(() => {});
			return data;
		}
	} catch {}
	return await fetcher();
}

export async function invalidate(...keys: string[]) {
	try {
		const client = getRedis();
		if (client) {
			await Promise.all(keys.map((k) => client.del(k).catch(() => {})));
		}
	} catch {}
}
