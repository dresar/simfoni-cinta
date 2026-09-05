export function getShortPagination(
	currentPage: number,
	totalPages: number,
): number[] {
	if (totalPages <= 3) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	let start = Math.max(1, currentPage - 1);
	let end = Math.min(totalPages, currentPage + 1);

	if (currentPage <= 2) {
		start = 1;
		end = 3;
	} else if (currentPage >= totalPages - 1) {
		start = totalPages - 2;
		end = totalPages;
	}

	const pages: number[] = [];
	for (let i = start; i <= end; i++) {
		pages.push(i);
	}
	return pages;
}
