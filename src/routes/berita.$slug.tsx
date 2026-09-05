import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Clock,
	Calendar,
	User,
	Share2,
	MessageCircle,
	Facebook,
	Twitter,
	Sparkles,
	Tag,
	CheckCircle2,
	ChevronDown,
	Check,
	Copy,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections-b";
import { FloatingWa } from "@/components/landing/floating-wa";
import blogData from "@/data/blog-manifest.json";

type TableRow = {
	aspect: string;
	manual: string;
	digital: string;
};

type FAQ = {
	q: string;
	a: string;
};

type Article = {
	slug: string;
	title: string;
	category: string;
	summary: string;
	thumbnail: string;
	readTime: number;
	date: string;
	author: string;
	tags: string[];
	keywords: string[];
	points?: string[];
	tableRows?: TableRow[];
	faqs?: FAQ[];
};

const ARTICLES: Article[] = blogData as Article[];

export const Route = createFileRoute("/berita/$slug")({
	loader: ({ params }) => {
		const article = ARTICLES.find((a) => a.slug === params.slug);
		return { article, slug: params.slug };
	},
	head: ({ loaderData }) => {
		const article = loaderData?.article;
		const slug = loaderData?.slug || "";
		const title = article
			? `${article.title} — Simfoni Cinta`
			: "Artikel & Tips Pernikahan — Simfoni Cinta";
		const desc =
			article?.summary ||
			"Panduan, tren tema, dan tips pernikahan terbaik dari Simfoni Cinta.";
		const url = `https://simfonicinta.my.id/berita/${slug}`;
		const image =
			article?.thumbnail || "https://simfonicinta.my.id/simfoni-cinta-og.jpg";

		const articleJsonLd = article
			? {
					"@context": "https://schema.org",
					"@type": "Article",
					headline: article.title,
					description: article.summary,
					image: [article.thumbnail],
					datePublished: article.date,
					author: {
						"@type": "Person",
						name: article.author,
					},
					publisher: {
						"@type": "Organization",
						name: "Simfoni Cinta",
						url: "https://simfonicinta.my.id",
						logo: {
							"@type": "ImageObject",
							url: "https://simfonicinta.my.id/logo.png",
						},
					},
					mainEntityOfPage: {
						"@type": "WebPage",
						"@id": url,
					},
				}
			: null;

		const faqJsonLd =
			article?.faqs && article.faqs.length > 0
				? {
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: article.faqs.map((f) => ({
							"@type": "Question",
							name: f.q,
							acceptedAnswer: {
								"@type": "Answer",
								text: f.a,
							},
						})),
					}
				: null;

		const scripts = [];
		if (articleJsonLd) {
			scripts.push({
				type: "application/ld+json",
				children: JSON.stringify(articleJsonLd),
			});
		}
		if (faqJsonLd) {
			scripts.push({
				type: "application/ld+json",
				children: JSON.stringify(faqJsonLd),
			});
		}

		return {
			meta: [
				{ title },
				{ name: "description", content: desc },
				{
					name: "keywords",
					content:
						article?.keywords?.join(", ") ||
						article?.tags?.join(", ") ||
						"undangan digital, pernikahan",
				},
				{ name: "author", content: article?.author || "Simfoni Cinta" },
				{ property: "og:type", content: "article" },
				{ property: "og:site_name", content: "Simfoni Cinta" },
				{ property: "og:title", content: title },
				{ property: "og:description", content: desc },
				{ property: "og:url", content: url },
				{ property: "og:image", content: image },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: desc },
				{ name: "twitter:image", content: image },
			],
			links: [{ rel: "canonical", href: url }],
			scripts,
		};
	},
	component: RouteComponent,
});

const CATEGORY_COLORS: Record<string, string> = {
	"Adat & Tradisi": "bg-gold/15 text-gold border border-gold/30",
	"Tema & Desain": "bg-primary/10 text-primary border border-primary/25",
	"Panduan Fitur": "bg-sage/15 text-sage border border-sage/30",
	"Tips & Anggaran": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
	"Kata-Kata & Doa": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
	"Vendor & Persiapan": "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
};

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function renderMarkdownInline(text: string): React.ReactNode {
	if (!text) return null;

	let s = text.replace(/\*{3,}/g, "**");
	s = s.replace(/^\*([^*\n]+)\*$/, "$1");

	const tokenRegex = /(\*\*.*?\*\*|\*[^*\n]+?\*|\[.*?\]\(.*?\))/g;
	const parts = s.split(tokenRegex);

	return parts.map((part, i) => {
		if (!part) return null;

		if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
			const inner = part.slice(2, -2).replace(/^\*+|\*+$/g, "");
			return (
				<strong key={i} className="font-bold text-foreground">
					{renderMarkdownInline(inner)}
				</strong>
			);
		}

		if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
			const inner = part.slice(1, -1).replace(/^\*+|\*+$/g, "");
			return (
				<em key={i} className="italic text-foreground/90">
					{renderMarkdownInline(inner)}
				</em>
			);
		}

		if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
			const m = part.match(/^\[(.*?)\]\((.*?)\)$/);
			if (m) {
				const [, label, url] = m;
				return (
					<a
						key={i}
						href={url}
						target={url.startsWith("http") ? "_blank" : undefined}
						rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
						className="text-primary font-semibold hover:underline decoration-primary/40"
					>
						{renderMarkdownInline(label)}
					</a>
				);
			}
		}

		const cleaned = part.replace(/\*{2,}/g, "").replace(/(?<!\w)\*(?!\w)/g, "");
		return cleaned;
	});
}

function ShareBox({ title, slug }: { title: string; slug: string }) {
	const [copied, setCopied] = useState(false);
	const url = `https://simfonicinta.my.id/berita/${slug}`;
	const text = `Baca panduan pernikahan menarik: "${title}" di Simfoni Cinta:`;

	const handleCopy = () => {
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="mt-10 pt-8 border-t border-border">
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-secondary/30 border border-border">
				<div className="flex items-center gap-2">
					<Share2 className="w-4 h-4 text-primary" />
					<span className="text-xs font-semibold text-foreground">
						Bagikan artikel ini:
					</span>
				</div>
				<div className="flex items-center gap-2">
					<a
						href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 text-xs font-medium transition-colors"
					>
						<MessageCircle className="w-3.5 h-3.5" /> WhatsApp
					</a>
					<a
						href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 text-xs font-medium transition-colors"
					>
						<Twitter className="w-3.5 h-3.5" /> X
					</a>
					<a
						href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 text-xs font-medium transition-colors"
					>
						<Facebook className="w-3.5 h-3.5" /> Facebook
					</a>
					<button
						onClick={handleCopy}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:border-primary/40 text-xs font-medium transition-colors"
					>
						{copied ? (
							<>
								<Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
							</>
						) : (
							<>
								<Copy className="w-3.5 h-3.5" /> Salin Tautan
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

function RelatedArticles({ current }: { current: Article }) {
	const related = ARTICLES.filter(
		(a) => a.category === current.category && a.slug !== current.slug,
	).slice(0, 3);

	if (related.length === 0) return null;

	return (
		<div className="mt-14 pt-10 border-t border-border">
			<h3 className="font-serif text-xl text-foreground mb-6">
				Artikel Terkait Kategori {current.category}
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
				{related.map((a) => (
					<Link
						key={a.slug}
						to="/berita/$slug"
						params={{ slug: a.slug }}
						className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
					>
						<img
							src={a.thumbnail}
							alt={a.title}
							loading="lazy"
							className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div className="p-4">
							<span
								className={`text-[0.62rem] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] ?? "bg-secondary/80 text-foreground/70 border border-border"}`}
							>
								{a.category}
							</span>
							<p className="font-serif text-[0.88rem] mt-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
								{a.title}
							</p>
							<p className="text-[0.72rem] text-muted-foreground mt-2 flex items-center gap-1">
								<Clock className="w-3 h-3" /> {a.readTime} menit baca
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
	const [openIdx, setOpenIdx] = useState<number | null>(0);

	return (
		<div className="space-y-3 mt-4">
			{faqs.map((f, idx) => {
				const isOpen = openIdx === idx;
				return (
					<div
						key={idx}
						className="border border-border rounded-2xl bg-card overflow-hidden transition-colors"
					>
						<button
							onClick={() => setOpenIdx(isOpen ? null : idx)}
							className="w-full text-left p-4.5 flex items-center justify-between gap-4 font-serif text-[0.95rem] text-foreground hover:text-primary transition-colors"
						>
							<span>{f.q}</span>
							<ChevronDown
								className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
									isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
								}`}
							/>
						</button>
						{isOpen && (
							<div className="px-4.5 pb-4.5 text-[0.88rem] text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
								{f.a}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function RouteComponent() {
	const { slug } = useParams({ from: "/berita/$slug" });
	const article = ARTICLES.find((a) => a.slug === slug);
	const [markdownContent, setMarkdownContent] = useState<string>("");

	useEffect(() => {
		if (!slug) return;
		const folder = (article as any)?.folder;
		const url = folder ? `/blog/${folder}/${slug}.md` : `/blog/${slug}.md`;
		fetch(url)
			.then((r) => r.text())
			.then((t) => {
				if (t && !t.includes("<!DOCTYPE html>")) {
					const cleanBody = t
						.replace(/^---[\s\S]*?---/, "")
						.replace(/^#\s+[^\n]+/, "")
						.trim();
					setMarkdownContent(cleanBody);
				}
			})
			.catch(() => {});
	}, [slug, article]);

	if (!article) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center">
				<Navbar />
				<div className="text-center pt-32 pb-20 px-4">
					<p className="text-6xl mb-4">📰</p>
					<h1 className="font-serif text-2xl text-foreground mb-2">
						Artikel Tidak Ditemukan
					</h1>
					<p className="text-muted-foreground text-[0.88rem] mb-6">
						Artikel yang Anda cari tidak tersedia atau tautannya telah dipindahkan.
					</p>
					<Link
						to="/berita"
						className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lift"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Berita
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Navbar />
			<div className="pt-16">
				<div className="relative h-64 md:h-96 overflow-hidden bg-muted">
					<img
						src={article.thumbnail}
						alt={article.title}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
				</div>

				<div className="max-w-3xl mx-auto px-4">
					<article className="bg-card rounded-3xl border border-border shadow-soft -mt-16 relative z-10 p-6 md:p-10">
						<Link
							to="/berita"
							className="inline-flex items-center gap-1.5 text-[0.82rem] text-muted-foreground hover:text-primary font-medium transition-colors mb-6 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Kembali ke Katalog Berita & Tips
						</Link>

						<div className="flex flex-wrap items-center gap-2.5 mb-4">
							<span
								className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] ?? "bg-secondary/80 text-foreground/70 border border-border"}`}
							>
								{article.category}
							</span>
							{article.tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1 text-[0.68rem] text-muted-foreground bg-secondary/60 border border-border px-2.5 py-0.5 rounded-full"
								>
									<Tag className="w-3 h-3" />
									{tag}
								</span>
							))}
						</div>

						<h1 className="font-serif text-2xl md:text-3.5xl text-foreground leading-snug mb-5">
							{article.title}
						</h1>

						<div className="flex flex-wrap items-center gap-4 text-[0.82rem] text-muted-foreground pb-6 border-b border-border mb-8">
							<span className="flex items-center gap-1.5">
								<div className="grid h-7 w-7 place-items-center rounded-full border border-sage/35 bg-secondary/60">
									<User className="w-3.5 h-3.5 text-primary" />
								</div>
								<span className="font-medium text-foreground">
									{article.author}
								</span>
							</span>
							<span className="flex items-center gap-1.5">
								<Calendar className="w-4 h-4" />
								{formatDate(article.date)}
							</span>
							<span className="flex items-center gap-1.5">
								<Clock className="w-4 h-4" />
								{article.readTime} menit baca
							</span>
						</div>

						<div className="mb-8 p-5 md:p-6 rounded-2xl border border-primary/30 bg-primary/5 relative overflow-hidden">
							<div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
								<Sparkles className="w-4 h-4" />
								Ringkasan Inti (AI Overview / Direct Answer)
							</div>
							<p className="text-[0.92rem] text-foreground leading-relaxed font-sans">
								{article.summary}
							</p>
						</div>

						<div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed space-y-6">
							{markdownContent ? (
								<div className="space-y-4 text-[0.92rem] text-muted-foreground leading-relaxed">
									{markdownContent.split("\n\n").map((block, idx) => {
										const trimmed = block.trim();
										if (!trimmed) return null;

										if (trimmed === "---" || trimmed === "***" || trimmed === "___" || /^[-*_]{3,}$/.test(trimmed)) {
											return <hr key={idx} className="my-8 border-border/60" />;
										}

										if (trimmed.startsWith("## ")) {
											const headingText = trimmed.replace(/^##\s+/, "").replace(/^\*+|\*+$/g, "");
											return (
												<h2
													key={idx}
													className="font-serif text-xl md:text-2xl text-foreground font-semibold pt-6 pb-2 border-b border-border/60"
												>
													{renderMarkdownInline(headingText)}
												</h2>
											);
										}
										if (trimmed.startsWith("### ")) {
											const headingText = trimmed.replace(/^###\s+/, "").replace(/^\*+|\*+$/g, "");
											return (
												<h3
													key={idx}
													className="font-serif text-lg text-foreground font-medium pt-4"
												>
													{renderMarkdownInline(headingText)}
												</h3>
											);
										}
										if (trimmed.startsWith("> ")) {
											const quoteText = trimmed.replace(/^>\s+/, "");
											return (
												<div
													key={idx}
													className="p-4 md:p-5 rounded-2xl bg-primary/5 border border-primary/20 text-foreground text-[0.9rem] italic leading-relaxed"
												>
													{renderMarkdownInline(quoteText)}
												</div>
											);
										}
										if (trimmed.startsWith("```")) {
											const code = trimmed.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");
											return (
												<pre
													key={idx}
													className="p-4 rounded-2xl bg-secondary/70 border border-border text-xs font-mono overflow-x-auto text-foreground my-4 leading-normal"
												>
													{code}
												</pre>
											);
										}
										if (trimmed.startsWith("|")) {
											const rows = trimmed
												.split("\n")
												.filter((r) => r.trim() && !r.includes("---"));
											if (rows.length === 0) return null;
											const headerCols = rows[0]
												.split("|")
												.filter((c) => c.trim())
												.map((c) => c.trim().replace(/^\*+|\*+$/g, ""));
											const bodyRows = rows.slice(1).map((r) =>
												r
													.split("|")
													.filter((c) => c.trim())
													.map((c) => c.trim().replace(/^\*+|\*+$/g, "")),
											);

											return (
												<div
													key={idx}
													className="overflow-x-auto rounded-2xl border border-border my-6"
												>
													<table className="w-full text-left border-collapse text-xs md:text-sm">
														<thead>
															<tr className="bg-secondary/70 border-b border-border text-foreground">
																{headerCols.map((h, hi) => (
																	<th key={hi} className="p-3.5 font-semibold">
																		{renderMarkdownInline(h)}
																	</th>
																))}
															</tr>
														</thead>
														<tbody className="divide-y divide-border">
															{bodyRows.map((cols, ri) => (
																<tr
																	key={ri}
																	className="hover:bg-secondary/25 transition-colors"
																>
																	{cols.map((col, ci) => (
																		<td
																			key={ci}
																			className={`p-3.5 ${
																				ci === 0
																					? "font-medium text-foreground"
																					: "text-muted-foreground"
																			}`}
																		>
																			{renderMarkdownInline(col)}
																		</td>
																	))}
																</tr>
															))}
														</tbody>
													</table>
												</div>
											);
										}
										if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || /^\d+\.\s+/.test(trimmed)) {
											const items = trimmed
												.split("\n")
												.filter((l) => /^(\*|\-|\d+\.)\s+/.test(l.trim()));
											return (
												<ul key={idx} className="space-y-2 my-4 pl-2">
													{items.map((it, ii) => {
														const cleanItem = it.replace(/^(\*|\-|\d+\.)\s+/, "");
														return (
															<li
																key={ii}
																className="flex items-start gap-2 text-[0.9rem] text-muted-foreground"
															>
																<span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
																<span>{renderMarkdownInline(cleanItem)}</span>
															</li>
														);
													})}
												</ul>
											);
										}

										return (
											<p key={idx} className="text-[0.92rem] text-muted-foreground leading-relaxed my-3">
												{renderMarkdownInline(trimmed)}
											</p>
										);
									})}
								</div>
							) : (
								<>
									<section>
										<h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
											1. Mengapa Hal Ini Sangat Krusial?
										</h2>
										<p className="text-[0.92rem] text-muted-foreground leading-relaxed">
											Merencanakan hari pernikahan membutuhkan ketelitian tingkat tinggi, keselarasan visi antar kedua keluarga, serta manajemen waktu dan anggaran yang efisien. Memahami setiap detail seputar <strong>{article.title}</strong> akan membantu Anda dan pasangan menghindari kesalahpahaman, mengurangi stres menjelang hari bahagia, dan memastikan seluruh rangkaian acara terlaksana secara khidmat dan elegan.
										</p>
									</section>

									{article.points && article.points.length > 0 && (
										<section className="pt-4">
											<h2 className="font-serif text-xl md:text-2xl text-foreground mb-4">
												2. Poin Kunci & Panduan Praktis
											</h2>
											<div className="grid grid-cols-1 gap-3.5">
												{article.points.map((pt, idx) => {
													const [title, desc] = pt.includes(":")
														? pt.split(":")
														: [`Poin ${idx + 1}`, pt];
													return (
														<div
															key={idx}
															className="p-4 rounded-2xl border border-border bg-secondary/25 flex items-start gap-3.5"
														>
															<div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary text-xs font-bold mt-0.5">
																{idx + 1}
															</div>
															<div className="text-[0.88rem] leading-relaxed">
																<strong className="text-foreground font-semibold">
																	{title}:
																</strong>{" "}
																<span className="text-muted-foreground">{desc}</span>
															</div>
														</div>
													);
												})}
											</div>
										</section>
									)}

									{article.tableRows && article.tableRows.length > 0 && (
										<section className="pt-4">
											<h2 className="font-serif text-xl md:text-2xl text-foreground mb-3">
												3. Perbandingan Solusi Konvensional vs. Undangan Digital Simfoni Cinta
											</h2>
											<div className="overflow-x-auto rounded-2xl border border-border mt-3">
												<table className="w-full text-left border-collapse text-xs md:text-sm">
													<thead>
														<tr className="bg-secondary/60 border-b border-border text-foreground">
															<th className="p-3.5 font-semibold">Aspek Pertimbangan</th>
															<th className="p-3.5 font-semibold">Metode Konvensional</th>
															<th className="p-3.5 font-semibold text-primary">Solusi Modern Simfoni Cinta</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-border">
														{article.tableRows.map((row, idx) => (
															<tr key={idx} className="hover:bg-secondary/20 transition-colors">
																<td className="p-3.5 font-medium text-foreground">{row.aspect}</td>
																<td className="p-3.5 text-muted-foreground">{row.manual}</td>
																<td className="p-3.5 text-foreground font-medium bg-primary/5">{row.digital}</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</section>
									)}

									{article.faqs && article.faqs.length > 0 && (
										<section className="pt-4">
											<h2 className="font-serif text-xl md:text-2xl text-foreground mb-2">
												4. Pertanyaan yang Sering Diajukan (FAQ)
											</h2>
											<p className="text-[0.88rem] text-muted-foreground mb-4">
												Pertanyaan umum seputar topik {article.title} yang paling sering diajukan calon pengantin:
											</p>
											<FAQAccordion faqs={article.faqs} />
										</section>
									)}
								</>
							)}
						</div>

						<div className="mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-primary/15 via-gold/10 to-sage/10 border border-primary/25 text-center">
							<h3 className="font-serif text-2xl text-foreground mb-2">
								Wujudkan Undangan Digital Impianmu Bersama Simfoni Cinta
							</h3>
							<p className="text-muted-foreground text-[0.88rem] max-w-lg mx-auto mb-6 leading-relaxed">
								Mulai dari Rp15.000 sekali bayar tanpa langganan. Lengkap dengan alunan musik romantis, amplop digital QRIS tanpa potongan, RSVP real-time, dan unlimited nama tamu.
							</p>
							<div className="flex items-center justify-center gap-3 flex-wrap">
								<a
									href="/#template"
									className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:-translate-y-0.5 hover:shadow-lift transition-all"
								>
									Lihat Koleksi Template <CheckCircle2 className="w-4 h-4" />
								</a>
								<a
									href="/demo"
									className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-foreground text-xs font-semibold hover:border-primary/40 transition-all"
								>
									Coba Demo Interaktif
								</a>
							</div>
						</div>

						<ShareBox title={article.title} slug={article.slug} />
						<RelatedArticles current={article} />
					</article>
				</div>

				<div className="pb-16" />
			</div>

			<Footer />
			<FloatingWa />
		</div>
	);
}
