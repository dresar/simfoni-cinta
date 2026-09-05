import { createServerFn } from "@tanstack/react-start";
import defaultStats from "@/private/graphify/stats.json";

export interface GraphifyGodNode {
	id: string;
	label: string;
	degree: number;
	sourceFile: string;
	community: string;
	fileType: string;
}

export interface GraphifyCommunity {
	name: string;
	count: number;
	sampleNodes: string[];
}

export interface GraphifyStats {
	totalNodes: number;
	totalEdges: number;
	totalCommunities: number;
	godNodes: GraphifyGodNode[];
	topCommunities: GraphifyCommunity[];
	reportMarkdown: string;
	lastUpdated: string;
	engine: string;
}

export const fetchGraphifyStatsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<GraphifyStats> => {
		try {
			if (typeof process !== "undefined" && process.versions?.node) {
				const fs = await import("node:fs");
				const path = await import("node:path");
				const statsFile = path.resolve(process.cwd(), "src", "private", "graphify", "stats.json");
				if (fs.existsSync(statsFile)) {
					const content = fs.readFileSync(statsFile, "utf-8");
					return JSON.parse(content) as GraphifyStats;
				}
			}
		} catch {}
		return defaultStats as GraphifyStats;
	},
);

export const triggerGraphifyRegenerateFn = createServerFn({ method: "POST" }).handler(
	async () => {
		try {
			if (typeof process !== "undefined" && process.versions?.node) {
				const { updateGraphifyFiles } = await import("../../scripts/update-graphify.mjs");
				const result = updateGraphifyFiles();
				return { success: true, ...result };
			}
		} catch (err: any) {
			return { success: false, error: err?.message || "Gagal memperbarui graf" };
		}
		return { success: false, error: "Environment runtime tidak mendukung eksekusi lokal" };
	},
);
