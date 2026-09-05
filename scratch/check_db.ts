import { db } from "@/lib/db/client";
import { templateAssetItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
	const rows = await db
		.select()
		.from(templateAssetItems)
		.where(eq(templateAssetItems.templateSlug, "tree-of-bird"))
		.limit(10);
	console.log("Rows in DB:", JSON.stringify(rows, null, 2));
}

main().catch(console.error);
