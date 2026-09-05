import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const graphifyExe = "C:\\Users\\NCN0C\\AppData\\Roaming\\uv\\tools\\graphifyy\\Scripts\\graphify.exe";

export function updateGraphifyFiles() {
	if (fs.existsSync(graphifyExe)) {
		try {
			spawnSync(graphifyExe, ["extract", ".", "--code-only"], {
				cwd: rootDir,
				stdio: "inherit",
				shell: true,
			});
		} catch (err) {
			console.error(err);
		}

		try {
			spawnSync(graphifyExe, ["tree", "--graph", "graphify-out/graph.json", "--output", "graphify-out/GRAPH_TREE.html"], {
				cwd: rootDir,
				stdio: "inherit",
				shell: true,
			});
		} catch (err) {
			console.error(err);
		}
	}

	const candidates = [
		path.join(rootDir, "graphify-out"),
		path.join(rootDir, "graphify-out", "graphify-out"),
	];

	const targetDir = path.join(rootDir, "src", "private", "graphify");
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	for (const srcDir of candidates) {
		if (fs.existsSync(srcDir)) {
			const entries = fs.readdirSync(srcDir);
			for (const entry of entries) {
				const srcFile = path.join(srcDir, entry);
				const destFile = path.join(targetDir, entry);
				const stat = fs.statSync(srcFile);
				if (!stat.isDirectory()) {
					fs.copyFileSync(srcFile, destFile);
				}
			}
		}
	}

	const statsScript = path.join(rootDir, "scripts", "generate-graphify-stats.mjs");
	spawnSync("node", [statsScript], {
		cwd: rootDir,
		stdio: "inherit",
		shell: true,
	});

	return {
		success: true,
		timestamp: new Date().toISOString(),
	};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	updateGraphifyFiles();
}
