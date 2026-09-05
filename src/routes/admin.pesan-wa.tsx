import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
	PageHead,
	GlassCard,
	Action,
	Pill,
	Field,
	TextInput,
	TextArea,
} from "@/components/kit";
import {
	WhatsappLogo,
	Plus,
	PencilSimple,
	Trash,
	Copy,
	Check,
	Tag,
	ArrowLeft,
	VideoCamera,
	Phone,
	DotsThreeVertical,
	Smiley,
	Paperclip,
	Microphone,
	X,
	List,
	DeviceMobile,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/pesan-wa")({
	head: () => ({
		meta: [
			{ title: "Template Pesan WA — Simfoni Cinta" },
			{
				name: "description",
				content:
					"Kelola master template pesan WhatsApp untuk seluruh pengguna platform.",
			},
		],
	}),
	component: TemplatePesanWaPage,
});

type TemplateCategory = "formal" | "kasual" | "pengingat" | "ucapan";

type WaTemplate = {
	id: string;
	name: string;
	category: TemplateCategory;
	body: string;
};

const categoryLabel: Record<TemplateCategory, string> = {
	formal: "Formal",
	kasual: "Kasual",
	pengingat: "Pengingat H-1",
	ucapan: "Ucapan Terima Kasih",
};

const categoryTone: Record<TemplateCategory, string> = {
	formal: "bg-blue-500/10 text-blue-400 border-blue-500/25",
	kasual: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
	pengingat: "bg-amber-500/10 text-amber-400 border-amber-500/25",
	ucapan: "bg-rose-500/10 text-rose-400 border-rose-500/25",
};

const placeholderTags = [
	{ key: "{nama_tamu}", label: "Nama Tamu" },
	{ key: "{nama_mempelai}", label: "Nama Mempelai" },
	{ key: "{tanggal_acara}", label: "Tanggal Acara" },
	{ key: "{link_undangan}", label: "Link Undangan" },
];

const defaultTemplates: WaTemplate[] = [
	{
		id: "1",
		name: "Undangan Formal",
		category: "formal",
		body: `Kepada Yth.
*{nama_tamu}*
di Tempat

_Assalamu'alaikum Warahmatullahi Wabarakatuh_

Dengan penuh rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:

*{nama_mempelai}*

📅 *Waktu:* {tanggal_acara}

Silakan klik tautan undangan digital berikut:
🔗 {link_undangan}

Merupakan kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir.

Terima kasih.
_Wassalamu'alaikum Warahmatullahi Wabarakatuh_

*{nama_mempelai}*`,
	},
	{
		id: "2",
		name: "Undangan Kasual",
		category: "kasual",
		body: `Hei {nama_tamu}! 👋

Kabar gembira nih — kami mau menikah! 🎉

✨ *{nama_mempelai}*
📅 {tanggal_acara}

Yuk hadir dan rayakan momen spesial ini bareng kami. Detail lengkapnya ada di sini:
👉 {link_undangan}

Ditunggu ya! 💛`,
	},
	{
		id: "3",
		name: "Pengingat Sehari Sebelum",
		category: "pengingat",
		body: `Halo {nama_tamu},

Hanya mau mengingatkan bahwa acara pernikahan *{nama_mempelai}* akan berlangsung _besok_.

📅 {tanggal_acara}

Cek detail lengkapnya di sini:
🔗 {link_undangan}

Sampai jumpa! 🙏`,
	},
	{
		id: "4",
		name: "Ucapan Terima Kasih",
		category: "ucapan",
		body: `Halo {nama_tamu},

Terima kasih telah hadir dan memberikan doa restu kepada kami, *{nama_mempelai}*. 💍

Kehadiran Anda membuat hari istimewa kami semakin berkesan. 🥹

Semoga kita selalu diberikan kesehatan dan kebahagiaan.

Dengan penuh syukur,
*{nama_mempelai}*`,
	},
];

function formatSampleWaText(raw: string): string {
	return raw
		.replace(/\{nama_tamu\}/g, "Bapak Budi & Ibu Ani")
		.replace(/\{nama_mempelai\}/g, "Rangga & Cinta")
		.replace(/\{tanggal_acara\}/g, "Sabtu, 28 November 2026")
		.replace(
			/\{link_undangan\}/g,
			"https://simfonicinta.my.id/u/rangga-cinta?to=Bapak+Budi",
		);
}

function renderWaBubbleText(raw: string): React.ReactNode[] {
	const lines = raw.split("\n");
	return lines.map((line, lineIdx) => {
		const parts: React.ReactNode[] = [];
		const regex = /(\*[^*]+\*|_[^_]+_|https?:\/\/[^\s]+)/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(line)) !== null) {
			if (match.index > lastIndex) {
				parts.push(line.slice(lastIndex, match.index));
			}
			const token = match[0];
			if (token.startsWith("*") && token.endsWith("*")) {
				parts.push(
					<strong
						key={`${lineIdx}-${match.index}`}
						className="font-semibold text-white"
					>
						{token.slice(1, -1)}
					</strong>,
				);
			} else if (token.startsWith("_") && token.endsWith("_")) {
				parts.push(
					<em
						key={`${lineIdx}-${match.index}`}
						className="italic text-emerald-100/90"
					>
						{token.slice(1, -1)}
					</em>,
				);
			} else if (token.startsWith("http")) {
				parts.push(
					<span
						key={`${lineIdx}-${match.index}`}
						className="text-[#53bdeb] underline decoration-[#53bdeb]/40 break-all font-medium"
					>
						{token}
					</span>,
				);
			}
			lastIndex = match.index + token.length;
		}

		if (lastIndex < line.length) {
			parts.push(line.slice(lastIndex));
		}

		return (
			<span key={lineIdx} className="block leading-relaxed break-words min-h-[1.25rem]">
				{parts.length > 0 ? parts : " "}
			</span>
		);
	});
}

function WaSmartphoneMockup({
	templateName,
	body,
	onCopy,
	copied,
}: {
	templateName: string;
	body: string;
	onCopy: () => void;
	copied: boolean;
}) {
	const sampleBody = formatSampleWaText(body);

	const handleTestSend = () => {
		const encoded = encodeURIComponent(sampleBody);
		window.open(`https://wa.me/?text=${encoded}`, "_blank");
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-2 flex-wrap">
				<div className="flex items-center gap-2">
					<span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
					<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
						WhatsApp Smartphone Preview
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={handleTestSend}
						className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
					>
						<WhatsappLogo className="size-3.5" weight="fill" />
						<span className="hidden sm:inline">Test Kirim</span> WA
					</button>
					<button
						type="button"
						onClick={onCopy}
						className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-amber-500/30 hover:text-amber-300 active:scale-95"
					>
						{copied ? (
							<>
								<Check className="size-3.5 text-emerald-400" weight="bold" />
								<span className="text-emerald-400">Tersalin</span>
							</>
						) : (
							<>
								<Copy className="size-3.5" weight="bold" />
								<span>Salin Teks</span>
							</>
						)}
					</button>
				</div>
			</div>

			<div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[32px] border-[6px] border-[#22272e] bg-[#0b141a] shadow-2xl">
				<div className="flex items-center justify-between bg-[#1f2c34] px-3 py-2.5 text-white shadow-sm">
					<div className="flex items-center gap-2 min-w-0">
						<ArrowLeft className="size-4 text-white/70 shrink-0 cursor-pointer" weight="bold" />
						<div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-xs font-bold text-stone-900 shadow-inner">
							AC
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-xs font-semibold leading-tight text-slate-100">
								Tamu Undangan
							</p>
							<p className="text-[10px] text-emerald-400 leading-tight">online</p>
						</div>
					</div>
					<div className="flex items-center gap-2.5 text-white/70 shrink-0">
						<VideoCamera className="size-4 hover:text-white transition" weight="fill" />
						<Phone className="size-4 hover:text-white transition" weight="fill" />
						<DotsThreeVertical className="size-4 hover:text-white transition" weight="bold" />
					</div>
				</div>

				<div className="relative flex min-h-[380px] max-h-[440px] flex-col justify-between overflow-y-auto p-3 bg-[#0b141a]">
					<div className="space-y-3">
						<div className="flex justify-center my-1">
							<span className="rounded-md bg-[#182229] px-2.5 py-0.5 text-[10px] font-medium text-white/60 shadow-xs">
								HARI INI
							</span>
						</div>

						<div className="flex justify-end">
							<div className="relative max-w-[90%] rounded-2xl rounded-tr-none bg-[#005c4b] p-3 text-xs sm:text-[13px] text-slate-100 shadow-md">
								{renderWaBubbleText(sampleBody)}
								<div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-white/50">
									<span>12:00</span>
									<span className="text-[#53bdeb] font-bold">✓✓</span>
								</div>
							</div>
						</div>
					</div>

					<div className="sticky bottom-0 -mx-3 -mb-3 mt-4 flex items-center gap-1.5 bg-[#1f2c34] p-2">
						<div className="flex flex-1 items-center gap-2 rounded-full bg-[#2a3942] px-3 py-1.5 text-white/60">
							<Smiley className="size-4 shrink-0 text-white/50" />
							<span className="text-[11px] text-white/40 truncate">Ketik pesan...</span>
							<Paperclip className="size-4 shrink-0 text-white/50 ml-auto" />
						</div>
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-md">
							<Microphone className="size-4" weight="fill" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TemplatePesanWaPage() {
	const [templates, setTemplates] = useState<WaTemplate[]>(defaultTemplates);
	const [editId, setEditId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [activeTab, setActiveTab] = useState<"list" | "editor">("list");
	const [activePreview, setActivePreview] = useState<string | null>(
		defaultTemplates[0]?.id ?? null,
	);
	const [copied, setCopied] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [form, setForm] = useState({
		name: "",
		category: "formal" as TemplateCategory,
		body: "",
	});

	const openCreate = () => {
		setForm({ name: "", category: "formal", body: "" });
		setEditId(null);
		setIsCreating(true);
		setActiveTab("editor");
	};

	const openEdit = (tpl: WaTemplate) => {
		setForm({ name: tpl.name, category: tpl.category, body: tpl.body });
		setEditId(tpl.id);
		setIsCreating(true);
		setActiveTab("editor");
	};

	const saveTemplate = () => {
		if (!form.name.trim() || !form.body.trim()) {
			toast.error("Nama template dan isi pesan wajib diisi.");
			return;
		}
		if (editId) {
			setTemplates((prev) =>
				prev.map((t) => (t.id === editId ? { ...t, ...form } : t)),
			);
			setActivePreview(editId);
			toast.success("Template berhasil diperbarui.");
		} else {
			const newId = Date.now().toString();
			setTemplates((prev) => [...prev, { id: newId, ...form }]);
			setActivePreview(newId);
			toast.success("Template baru berhasil dibuat.");
		}
		setIsCreating(false);
		setEditId(null);
	};

	const deleteTemplate = (id: string) => {
		setTemplates((prev) => prev.filter((t) => t.id !== id));
		if (activePreview === id) {
			setActivePreview(templates.find((t) => t.id !== id)?.id ?? null);
		}
		setDeleteId(null);
		toast.success("Template berhasil dihapus.");
	};

	const insertTag = (tag: string) => {
		if (textareaRef.current) {
			const el = textareaRef.current;
			const start = el.selectionStart ?? form.body.length;
			const end = el.selectionEnd ?? form.body.length;
			const newBody =
				form.body.substring(0, start) + tag + form.body.substring(end);
			setForm((f) => ({ ...f, body: newBody }));
			setTimeout(() => {
				el.focus();
				el.setSelectionRange(start + tag.length, start + tag.length);
			}, 50);
		} else {
			setForm((f) => ({ ...f, body: f.body + tag }));
		}
	};

	const handleCopy = useCallback((textToCopy: string) => {
		navigator.clipboard.writeText(textToCopy).then(() => {
			setCopied(true);
			toast.success("Teks template berhasil disalin ke clipboard.");
			setTimeout(() => setCopied(false), 2000);
		});
	}, []);

	const previewTemplate = templates.find((t) => t.id === activePreview);

	return (
		<>
			<PageHead
				title="Pesan WhatsApp"
				subtitle="Master template broadcast dan undangan digital"
			>
				<Pill tone="matcha">{templates.length} template</Pill>
				<Action tone="gold" size="sm" onClick={openCreate}>
					<Plus className="size-4" weight="bold" />
					Buat Template
				</Action>
			</PageHead>

			<div className="mb-4 flex lg:hidden items-center rounded-xl border border-white/10 bg-white/5 p-1">
				<button
					type="button"
					onClick={() => setActiveTab("list")}
					className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all min-h-[44px] ${
						activeTab === "list"
							? "bg-[#c9a96e] text-stone-900 shadow-sm"
							: "text-white/70 hover:text-white"
					}`}
				>
					<List className="size-4" weight="bold" />
					<span>Daftar Template ({templates.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("editor")}
					className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all min-h-[44px] ${
						activeTab === "editor"
							? "bg-[#c9a96e] text-stone-900 shadow-sm"
							: "text-white/70 hover:text-white"
					}`}
				>
					<DeviceMobile className="size-4" weight="bold" />
					<span>{isCreating ? "Form Editor" : "Preview & Detail"}</span>
				</button>
			</div>

			<div className="grid gap-5 lg:grid-cols-12">
				<div
					className={`flex flex-col gap-3 lg:col-span-5 ${
						activeTab === "list" ? "flex" : "hidden lg:flex"
					}`}
				>
					{templates.map((tpl) => (
						<GlassCard
							key={tpl.id}
							className={`cursor-pointer p-3.5 sm:p-4 transition-all duration-200 ${
								activePreview === tpl.id
									? "border-[#c9a96e]/40 bg-[#c9a96e]/[0.06] shadow-md ring-1 ring-[#c9a96e]/20"
									: "hover:border-white/15 hover:bg-white/[0.03]"
							}`}
							onClick={() => {
								setActivePreview(tpl.id);
								if (window.innerWidth < 1024) {
									setActiveTab("editor");
								}
							}}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-white">
										{tpl.name}
									</p>
									<span
										className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${categoryTone[tpl.category]}`}
									>
										{categoryLabel[tpl.category]}
									</span>
								</div>
								<div className="flex shrink-0 gap-1.5">
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											openEdit(tpl);
										}}
										className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-amber-500/30 hover:text-amber-300"
										aria-label="Edit template"
									>
										<PencilSimple className="size-4" weight="bold" />
									</button>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setDeleteId(tpl.id);
										}}
										className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-red-500/30 hover:text-red-400"
										aria-label="Hapus template"
									>
										<Trash className="size-4" weight="bold" />
									</button>
								</div>
							</div>
							<p className="mt-2.5 line-clamp-2 text-xs text-white/50 leading-relaxed font-mono">
								{tpl.body
									.replace(/\*([^*]+)\*/g, "$1")
									.replace(/_([^_]+)_/g, "$1")}
							</p>
						</GlassCard>
					))}

					{templates.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-12 text-center">
							<WhatsappLogo
								className="size-10 text-slate-600 mb-2"
								weight="duotone"
							/>
							<p className="text-sm font-semibold text-slate-300">
								Belum ada template
							</p>
							<p className="text-xs text-slate-500 mt-1 mb-4">
								Klik tombol di bawah untuk membuat template pertama
							</p>
							<Action tone="gold" size="sm" onClick={openCreate}>
								<Plus className="size-4" weight="bold" />
								Buat Template
							</Action>
						</div>
					)}
				</div>

				<div
					className={`lg:col-span-7 flex flex-col gap-4 ${
						activeTab === "editor" ? "flex" : "hidden lg:flex"
					}`}
				>
					{isCreating ? (
						<GlassCard className="flex flex-col gap-3.5 p-3.5 sm:p-4">
							<div className="flex items-center justify-between pb-2 border-b border-white/5">
								<p className="text-xs sm:text-sm font-bold text-white">
									{editId ? "Edit Template Pesan" : "Buat Template Baru"}
								</p>
								<button
									type="button"
									onClick={() => {
										setIsCreating(false);
										setEditId(null);
									}}
									className="text-xs text-white/50 hover:text-white"
								>
									Tutup
								</button>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<Field label="Nama Template">
									<TextInput
										placeholder="cth. Undangan Formal Keluarga"
										value={form.name}
										onChange={(e) =>
											setForm({ ...form, name: e.target.value })
										}
									/>
								</Field>

								<Field label="Kategori Pesan">
									<select
										value={form.category}
										onChange={(e) =>
											setForm({
												...form,
												category: e.target.value as TemplateCategory,
											})
										}
										className="w-full rounded-lg border border-white/10 bg-[#090c10] px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
									>
										{(
											Object.keys(categoryLabel) as TemplateCategory[]
										).map((c) => (
											<option key={c} value={c} className="bg-stone-900 text-white">
												{categoryLabel[c]}
											</option>
										))}
									</select>
								</Field>
							</div>

							<Field
								label="Isi Pesan WhatsApp"
								hint="Klik chip variabel di bawah untuk memasukkan otomatis ke teks"
							>
								<div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
									{placeholderTags.map((item) => (
										<button
											key={item.key}
											type="button"
											onClick={() => insertTag(item.key)}
											className="flex items-center gap-1 shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95"
										>
											<Tag className="size-3" weight="bold" />
											<span>{item.key}</span>
										</button>
									))}
								</div>

								<div className="relative">
									<textarea
										ref={textareaRef}
										placeholder="Tulis draf pesan WhatsApp..."
										value={form.body}
										onChange={(e) =>
											setForm({ ...form, body: e.target.value })
										}
										rows={8}
										className="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 p-3 font-mono text-xs text-slate-100 placeholder:text-white/20 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none resize-y"
									/>
									<div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
										<span>Format: *tebal*, _miring_</span>
										<span>
											{form.body.length.toLocaleString()} karakter |{" "}
											{form.body.split("\n").length} baris
										</span>
									</div>
								</div>
							</Field>

							{form.body.trim() && (
								<div className="mt-2 pt-3 border-t border-white/5">
									<WaSmartphoneMockup
										templateName={form.name || "Draf Template"}
										body={form.body}
										onCopy={() =>
											handleCopy(formatSampleWaText(form.body))
										}
										copied={copied}
									/>
								</div>
							)}

							<div className="flex gap-2 justify-end pt-2.5 border-t border-white/5">
								<Action
									tone="ghost"
									size="sm"
									onClick={() => {
										setIsCreating(false);
										setEditId(null);
									}}
								>
									Batal
								</Action>
								<Action tone="gold" size="sm" onClick={saveTemplate}>
									{editId ? "Simpan Perubahan" : "Simpan Template"}
								</Action>
							</div>
						</GlassCard>
					) : previewTemplate ? (
						<GlassCard className="p-3.5 sm:p-4 flex flex-col gap-3.5">
							<div className="flex items-center justify-between gap-3 pb-2.5 border-b border-white/5">
								<div className="min-w-0">
									<h3 className="truncate text-sm sm:text-base font-bold text-white">
										{previewTemplate.name}
									</h3>
									<span
										className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryTone[previewTemplate.category]}`}
									>
										{categoryLabel[previewTemplate.category]}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Action
										tone="ghost"
										size="sm"
										onClick={() => openEdit(previewTemplate)}
									>
										<PencilSimple className="size-3.5" weight="bold" />
										Edit
									</Action>
								</div>
							</div>

							<WaSmartphoneMockup
								templateName={previewTemplate.name}
								body={previewTemplate.body}
								onCopy={() =>
									handleCopy(formatSampleWaText(previewTemplate.body))
								}
								copied={copied}
							/>
						</GlassCard>
					) : null}
				</div>
			</div>

			{deleteId !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
					<GlassCard className="max-w-sm w-full p-4 sm:p-5 flex flex-col gap-3 animate-in fade-in zoom-in-95">
						<p className="text-sm sm:text-base font-bold text-white">Hapus template ini?</p>
						<p className="text-xs text-white/60 leading-relaxed">
							Tindakan ini tidak dapat dibatalkan. Template yang telah dihapus
							tidak akan tersedia untuk broadcast.
						</p>
						<div className="flex justify-end gap-2 mt-2">
							<Action
								tone="ghost"
								size="sm"
								onClick={() => setDeleteId(null)}
							>
								Batal
							</Action>
							<Action
								tone="danger"
								size="sm"
								onClick={() => deleteTemplate(deleteId)}
							>
								Hapus Template
							</Action>
						</div>
					</GlassCard>
				</div>
			)}
		</>
	);
}
