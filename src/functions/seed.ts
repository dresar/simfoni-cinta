import { createServerFn } from "@tanstack/react-start";
import { seedDatabase } from "@/lib/db/seed";

export const runSeed = createServerFn({ method: "POST" }).handler(() => {
	if (process.env.NODE_ENV !== "development") {
		throw new Error("Seeding is only allowed in development mode");
	}
	return seedDatabase();
});

