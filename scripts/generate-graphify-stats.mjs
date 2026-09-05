import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function parseGraphify() {
	let graphJsonPath = path.join(rootDir, "src", "private", "graphify", "graph.json");
	if (!fs.existsSync(graphJsonPath)) {
		graphJsonPath = path.join(rootDir, "graphify-out", "graphify-out", "graph.json");
	}
	if (!fs.existsSync(graphJsonPath)) {
		graphJsonPath = path.join(rootDir, "graphify-out", "graph.json");
	}

	let reportMdPath = path.join(rootDir, "src", "private", "graphify", "GRAPH_REPORT.md");
	if (!fs.existsSync(reportMdPath)) {
		reportMdPath = path.join(rootDir, "graphify-out", "graphify-out", "GRAPH_REPORT.md");
	}
	if (!fs.existsSync(reportMdPath)) {
		reportMdPath = path.join(rootDir, "graphify-out", "GRAPH_REPORT.md");
	}

	if (!fs.existsSync(graphJsonPath)) {
		console.error("graph.json not found!");
		process.exit(1);
	}

	const graphRaw = JSON.parse(fs.readFileSync(graphJsonPath, "utf-8"));
	const nodes = graphRaw.nodes || [];
	const links = graphRaw.links || [];

	const degreeMap = new Map();
	for (const link of links) {
		const source = typeof link.source === "object" ? link.source.id : link.source;
		const target = typeof link.target === "object" ? link.target.id : link.target;
		degreeMap.set(source, (degreeMap.get(source) || 0) + 1);
		degreeMap.set(target, (degreeMap.get(target) || 0) + 1);
	}

	const nodeById = new Map();
	for (const node of nodes) {
		nodeById.set(node.id, node);
	}

	const sortedNodesByDegree = [...degreeMap.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15)
		.map(([id, degree]) => {
			const n = nodeById.get(id);
			return {
				id,
				label: n?.label || id,
				degree,
				sourceFile: n?.source_file || "",
				community: n?.community_name || "",
				fileType: n?.file_type || "code"
			};
		});

	const communityMap = new Map();
	for (const node of nodes) {
		const comm = node.community_name || "Lainnya";
		if (!communityMap.has(comm)) {
			communityMap.set(comm, { name: comm, count: 0, sampleNodes: [] });
		}
		const cObj = communityMap.get(comm);
		cObj.count++;
		if (cObj.sampleNodes.length < 5) {
			cObj.sampleNodes.push(node.label || node.id);
		}
	}

	const topCommunities = [...communityMap.values()]
		.sort((a, b) => b.count - a.count)
		.slice(0, 12);

	let reportMd = "";
	if (fs.existsSync(reportMdPath)) {
		reportMd = fs.readFileSync(reportMdPath, "utf-8");
	}

	const stats = {
		totalNodes: nodes.length,
		totalEdges: links.length,
		totalCommunities: communityMap.size,
		godNodes: sortedNodesByDegree,
		topCommunities,
		reportMarkdown: reportMd,
		lastUpdated: new Date().toISOString(),
		engine: "Graphify AST Engine v0.9.50"
	};

	const outDir = path.join(rootDir, "src", "private", "graphify");
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}

	const outPath = path.join(outDir, "stats.json");
	fs.writeFileSync(outPath, JSON.stringify(stats, null, 2), "utf-8");
	console.log("Graphify stats generated successfully at:", outPath);
}

parseGraphify();
