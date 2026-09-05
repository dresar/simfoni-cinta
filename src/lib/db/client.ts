import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function cleanDbUrl(): string {
	const raw =
		process.env["DATABASE_URL"] ||
		(typeof globalThis !== "undefined" &&
			(globalThis as any)?.process?.env?.["DATABASE_URL"]) ||
		"";
	return raw.trim().replace(/^["']|["']$/g, "").trim();
}

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cachedSql: ReturnType<typeof neon> | null = null;
let lastDbUrl = "";

function createChainedFallback(): any {
	const fn = (..._args: any[]) => fn;
	fn.from = (..._args: any[]) => fn;
	fn.where = (..._args: any[]) => fn;
	fn.limit = (..._args: any[]) => fn;
	fn.offset = (..._args: any[]) => fn;
	fn.orderBy = (..._args: any[]) => fn;
	fn.leftJoin = (..._args: any[]) => fn;
	fn.rightJoin = (..._args: any[]) => fn;
	fn.innerJoin = (..._args: any[]) => fn;
	fn.returning = (..._args: any[]) => fn;
	fn.values = (..._args: any[]) => fn;
	fn.set = (..._args: any[]) => fn;
	fn.onConflictDoUpdate = (..._args: any[]) => fn;
	fn.then = (resolve: any) => Promise.resolve([]).then(resolve);
	fn.catch = (reject: any) => Promise.resolve([]).catch(reject);
	return fn;
}

export function getSql() {
	const currentUrl = cleanDbUrl();
	if (!currentUrl) {
		return (() => Promise.resolve([])) as unknown as ReturnType<typeof neon>;
	}
	if (!cachedSql || lastDbUrl !== currentUrl) {
		lastDbUrl = currentUrl;
		cachedSql = neon(currentUrl);
		cachedDb = drizzle(cachedSql, { schema });
	}
	return cachedSql;
}

export function getDb() {
	const currentUrl = cleanDbUrl();
	if (!currentUrl) {
		return null;
	}
	if (!cachedDb || lastDbUrl !== currentUrl) {
		lastDbUrl = currentUrl;
		cachedSql = neon(currentUrl);
		cachedDb = drizzle(cachedSql, { schema });
	}
	return cachedDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
	get(_target, prop) {
		const instance = getDb();
		if (!instance) {
			return createChainedFallback();
		}
		const val = (instance as any)[prop];
		if (typeof val === "function") {
			return val.bind(instance);
		}
		return val;
	},
});

export const sql = new Proxy((() => {}) as unknown as ReturnType<typeof neon>, {
	apply(_target, thisArg, argArray) {
		const instance = getSql();
		return Reflect.apply(instance as any, thisArg, argArray);
	},
	get(_target, prop) {
		const instance = getSql();
		const val = (instance as any)[prop];
		if (typeof val === "function") {
			return val.bind(instance);
		}
		return val;
	},
});
