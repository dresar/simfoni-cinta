import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImageFn } from "@/functions/upload";

export function Card({
	className,
	children,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"rounded-[10px] border border-slate-200/90 bg-white text-card-foreground shadow-xs transition-all duration-300 hover:shadow-sm dark:border-white/10 dark:bg-card",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardHeader({
	className,
	children,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col space-y-1 p-2.5 sm:p-3", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardTitle({
	className,
	children,
	...props
}: ComponentProps<"h3">) {
	return (
		<h3
			className={cn(
				"text-[13px] sm:text-[14px] font-bold leading-tight tracking-tight text-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</h3>
	);
}

export function CardDescription({
	className,
	children,
	...props
}: ComponentProps<"p">) {
	return (
		<p className={cn("text-[11px] text-muted-foreground", className)} {...props}>
			{children}
		</p>
	);
}

export function CardContent({
	className,
	children,
	...props
}: ComponentProps<"div">) {
	return (
		<div className={cn("p-2.5 sm:p-3 pt-0", className)} {...props}>
			{children}
		</div>
	);
}

export function CardFooter({
	className,
	children,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			className={cn("flex items-center p-2.5 sm:p-3 pt-0", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function GlassCard({
	className,
	children,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"rounded-[10px] border border-slate-200/90 bg-white text-slate-900 shadow-xs dark:border-white/10 dark:bg-[#0f141c]/90 dark:text-white dark:shadow-none transition-all duration-300",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

const toneMap = {
	matcha:
		"bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
	gold: "bg-amber-50 text-amber-900 border-amber-200 font-semibold dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
	info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
	success:
		"bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
	danger:
		"bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
	neutral:
		"bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-white/70 dark:border-white/10",
} as const;

export type Tone = keyof typeof toneMap;

export function Pill({
	tone = "neutral",
	className,
	children,
}: {
	tone?: Tone;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
				toneMap[tone],
				className,
			)}
		>
			{children}
		</span>
	);
}

const buttonTones = {
	primary:
		"bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs font-semibold dark:bg-emerald-600 dark:hover:bg-emerald-500",
	matcha:
		"bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs font-semibold dark:bg-emerald-600 dark:hover:bg-emerald-500",
	sage: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs font-semibold dark:bg-emerald-700 dark:hover:bg-emerald-600",
	gold: "bg-amber-600 hover:bg-amber-500 text-white shadow-xs font-semibold dark:bg-amber-600 dark:hover:bg-amber-500",
	preview:
		"bg-[#cbd5e1] hover:bg-[#94a3b8]/70 text-slate-900 font-medium dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white",
	pesan:
		"border border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2]/10 font-medium dark:border-[#06b6d4] dark:text-[#06b6d4] dark:hover:bg-[#06b6d4]/10",
	ghost:
		"bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:border-white/10",
	danger:
		"bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/25",
} as const;

type ActionProps = {
	tone?: keyof typeof buttonTones;
	size?: "xs" | "sm" | "md";
	className?: string;
	children: ReactNode;
};

export function Action({
	tone = "primary",
	size = "md",
	className,
	children,
	...props
}: ActionProps & ComponentProps<"button">) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer",
				size === "xs"
					? "rounded-[5px] py-1.5 px-3 text-[11px] sm:text-[12px] min-h-8"
					: size === "sm"
						? "rounded-lg min-h-8 px-3 text-xs"
						: "rounded-lg min-h-9 px-4 text-xs sm:text-sm",
				buttonTones[tone],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export function LinkAction({
	to,
	params,
	tone = "primary",
	size = "md",
	className,
	children,
	target,
	rel,
}: ActionProps & {
	to: string;
	params?: Record<string, string>;
	target?: string;
	rel?: string;
}) {
	return (
		<Link
			to={to}
			params={params as never}
			target={target}
			rel={rel}
			className={cn(
				"inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 active:scale-[0.98]",
				size === "xs"
					? "rounded-[5px] py-1.5 px-3 text-[11px] sm:text-[12px] min-h-8"
					: size === "sm"
						? "rounded-lg min-h-8 px-3 text-xs"
						: "rounded-lg min-h-9 px-4 text-xs sm:text-sm",
				buttonTones[tone],
				className,
			)}
		>
			{children}
		</Link>
	);
}

export function PageHead({
	title,
	subtitle,
	back,
	children,
}: {
	title: string;
	subtitle?: string;
	back?: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				{back ? (
					<Link
						to={back}
						className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white transition-colors"
						aria-label="Kembali"
					>
						<ArrowLeft className="size-4" />
					</Link>
				) : null}
				<div>
					<h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
						{title}
					</h1>
					{subtitle ? (
						<p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
							{subtitle}
						</p>
					) : null}
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2">{children}</div>
		</div>
	);
}

export function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-600 dark:text-white/60 uppercase">
				{label}
			</span>
			{children}
			{hint ? (
				<span className="text-[11px] text-slate-400 dark:text-white/40">
					{hint}
				</span>
			) : null}
		</label>
	);
}

export const controlClass =
	"min-h-9 w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-amber-500/50 dark:focus:ring-amber-500/20";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
	return <input className={cn(controlClass, className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
	return (
		<textarea
			rows={3}
			className={cn(controlClass, "py-2 leading-relaxed resize-none", className)}
			{...props}
		/>
	);
}

export interface SelectOption {
	label: string;
	value: string | number;
}

export function SelectInput({
	className,
	children,
	options,
	onChange,
	value,
	...props
}: Omit<ComponentProps<"select">, "onChange"> & {
	options?: SelectOption[];
	onChange?: (e: any) => void;
}) {
	return (
		<select
			className={cn(
				controlClass,
				"cursor-pointer bg-white text-slate-900 dark:bg-[#12161f] dark:text-white dark:border-white/10",
				className,
			)}
			value={typeof value === "object" && value !== null && "target" in value ? (value as any).target.value : value}
			onChange={(e) => {
				if (!onChange) return;
				onChange(e);
			}}
			{...props}
		>
			{options
				? options.map((opt) => (
						<option
							key={String(opt.value)}
							value={opt.value}
							className="bg-white text-slate-900 dark:bg-[#12161f] dark:text-white"
						>
							{opt.label}
						</option>
				  ))
				: children}
		</select>
	);
}

export function FormCard({
	title,
	icon,
	children,
	className,
	action,
}: {
	title?: string;
	icon?: ReactNode;
	children: ReactNode;
	className?: string;
	action?: ReactNode;
}) {
	return (
		<GlassCard
			className={cn(
				"p-3.5 sm:p-4 border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0f141c] space-y-3.5",
				className,
			)}
		>
			{title || action ? (
				<div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-white/10 pb-2.5">
					{title ? (
						<h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
							{icon}
							<span>{title}</span>
						</h3>
					) : null}
					{action}
				</div>
			) : null}
			{children}
		</GlassCard>
	);
}

export function FormShell({
	children,
	actions,
}: {
	children: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="space-y-4">
			{children}
			{actions && (
				<div className="flex justify-end gap-2 pt-3 border-t border-slate-200/70 dark:border-white/10">
					{actions}
				</div>
			)}
		</div>
	);
}

export function Metric({
	label,
	value,
	sub,
	icon,
	tone = "matcha",
}: {
	label: string;
	value: string;
	sub: string;
	icon: ReactNode;
	tone?: Tone;
}) {
	return (
		<GlassCard className="p-4">
			<div className="flex items-start justify-between gap-2">
				<p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-white/50 uppercase">
					{label}
				</p>
				<span
					className={cn(
						"flex size-9 items-center justify-center rounded-xl border",
						toneMap[tone],
					)}
				>
					{icon}
				</span>
			</div>
			<p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
				{value}
			</p>
			<p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{sub}</p>
		</GlassCard>
	);
}

export function Avatar({
	text,
	src,
	name,
	tone = "matcha",
	size = "md",
}: {
	text?: string;
	src?: string;
	name?: string;
	tone?: "matcha" | "gold";
	size?: "sm" | "md" | "lg";
}) {
	const [imgError, setImgError] = useState(false);

	useEffect(() => {
		setImgError(false);
	}, [src]);
	const dims = {
		sm: "size-8 text-[11px]",
		md: "size-10 text-xs",
		lg: "size-20 text-2xl",
	}[size];
	const initials = text ?? (name ? initialsOf(name) : "?");

	if (src && !imgError) {
		return (
			<img
				src={src}
				alt={name ?? "Avatar"}
				referrerPolicy="no-referrer"
				crossOrigin="anonymous"
				onError={() => setImgError(true)}
				className={cn(
					"rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-white/10 shrink-0",
					dims,
				)}
			/>
		);
	}

	return (
		<span
			className={cn(
				"flex shrink-0 items-center justify-center rounded-2xl font-bold uppercase ring-1 shadow-xs",
				dims,
				tone === "gold"
					? "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-gradient-to-br dark:from-amber-400/20 dark:to-amber-600/20 dark:text-amber-300 dark:ring-amber-500/30"
					: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-gradient-to-br dark:from-emerald-400/20 dark:to-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-500/30",
			)}
		>
			{initials}
		</span>
	);
}

export function initialsOf(name: string) {
	return name
		.replace(/&/g, " ")
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function DataTable({
	head,
	children,
}: {
	head: string[];
	children: ReactNode;
}) {
	return (
		<GlassCard className="overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[720px] text-left text-sm">
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/5">
							{head.map((item) => (
								<th
									key={item}
									className="px-4 py-3 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-white/40 uppercase"
								>
									{item}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 text-slate-900 dark:divide-white/5 dark:text-white">
						{children}
					</tbody>
				</table>
			</div>
		</GlassCard>
	);
}

export function ConfirmDelete({
	open,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<GlassCard className="w-full max-w-sm p-5">
				<h2 className="text-lg font-bold text-slate-900 dark:text-white">
					Hapus data?
				</h2>
				<p className="mt-1 text-sm text-slate-500 dark:text-white/60">
					Tindakan permanen.
				</p>
				<div className="mt-5 flex justify-end gap-2">
					<Action tone="ghost" onClick={onCancel}>
						Batal
					</Action>
					<Action tone="danger" onClick={onConfirm}>
						Hapus
					</Action>
				</div>
			</GlassCard>
		</div>
	);
}

export function LockedBanner({
	title = "Form Terkunci — Selesaikan Pembayaran Paket",
	message = "Fitur pengisian data undangan ini hanya dapat digunakan setelah Anda menyelesaikan pembayaran paket undangan di menu Paket & Pembayaran.",
}: {
	title?: string;
	message?: string;
}) {
	return (
		<div className="mb-6 rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 via-white to-rose-50/70 p-5 shadow-xs">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[10px] font-bold text-rose-900 uppercase">
						<span className="size-1.5 rounded-full bg-rose-600 animate-ping" />
						Pembayaran Diperlukan
					</div>
					<h3 className="text-sm font-bold text-slate-900">{title}</h3>
					<p className="text-xs text-slate-600 leading-relaxed max-w-xl">
						{message}
					</p>
				</div>
				<Link
					to="/dasbor/paket"
					className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-500 hover:to-amber-600 transition shadow-amber-600/20"
				>
					<span>Pilih & Bayar Paket</span>
					<ArrowRight className="size-3.5" />
				</Link>
			</div>
		</div>
	);
}

export function formatIdr(value: number) {
	return `Rp ${value.toLocaleString("id-ID")}`;
}

type ImageUploadFieldProps = {
	label?: string;
	value: string;
	onChange: (url: string) => void;
	aspect?: "square" | "video" | "cover" | "avatar";
	placeholder?: string;
	className?: string;
};

export function ImageUploadField({
	label,
	value,
	onChange,
	aspect = "video",
	placeholder = "Atau tempel URL gambar / CDN di sini...",
	className,
}: ImageUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	const aspectClass =
		{
			square: "aspect-square max-w-40 max-h-40",
			avatar: "aspect-square size-28 rounded-full",
			video: "aspect-video max-w-md max-h-44",
			cover: "aspect-[16/7] max-w-lg max-h-48",
		}[aspect] ?? "aspect-video max-w-md max-h-44";

	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const processFile = useCallback(
		(file: File) => {
			if (!file.type.startsWith("image/")) {
				toast.error("Hanya file gambar yang didukung.");
				return;
			}
			setUploading(true);
			setUploadProgress(25);
			const timer1 = setTimeout(() => setUploadProgress(60), 200);
			const timer2 = setTimeout(() => setUploadProgress(85), 500);

			const reader = new FileReader();
			reader.onload = async (e) => {
				const dataUrl = e.target?.result;
				if (typeof dataUrl === "string") {
					try {
						const folder = aspect === "avatar" ? "avatars" : "gallery";
						const res = await uploadImageFn({
							data: { fileData: dataUrl, folder },
						});
						clearTimeout(timer1);
						clearTimeout(timer2);
						setUploadProgress(100);
						if (res?.url) {
							const fullUrl = res.url.startsWith("http")
								? res.url
								: typeof window !== "undefined"
									? `${window.location.origin}${res.url}`
									: res.url;
							onChange(fullUrl);
							toast.success("Gambar berhasil diunggah ke CDN!");
							return;
						}
					} catch {
						onChange(dataUrl);
					} finally {
						setTimeout(() => setUploading(false), 600);
					}
				}
			};
			reader.readAsDataURL(file);
		},
		[onChange, aspect],
	);

	return (
		<div className={cn("flex flex-col gap-2 max-w-md", className)}>
			{label && (
				<span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/40">
					{label}
				</span>
			)}
			<div
				className={cn(
					"relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
					aspectClass,
					dragging
						? "border-amber-600 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-500/8"
						: "border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/20 dark:border-white/12 dark:bg-white/[0.03] dark:hover:border-white/25 dark:hover:bg-white/[0.06]",
				)}
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					const file = e.dataTransfer.files[0];
					if (file) processFile(file);
				}}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
				aria-label="Area unggah gambar drag & drop"
			>
				{value ? (
					<>
						<img
							src={value}
							alt="Preview gambar"
							referrerPolicy="no-referrer"
							crossOrigin="anonymous"
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
							<div className="flex flex-col items-center gap-1.5 text-white">
								<ImagePlus className="size-6" />
								<span className="text-xs font-semibold">Ganti Gambar</span>
							</div>
						</div>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onChange("");
							}}
							className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/80 transition hover:bg-rose-500/80 hover:text-white"
							aria-label="Hapus gambar"
						>
							<X className="size-3.5" />
						</button>
					</>
				) : (
					<div className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-4 text-center">
						<div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
							<ImagePlus className="size-5 text-slate-400 dark:text-white/40" />
						</div>
						<div>
							<p className="text-xs font-semibold text-slate-700 dark:text-white/70">
								Pilih atau seret gambar
							</p>
							<p className="mt-0.5 text-[11px] text-slate-400 dark:text-white/30">
								PNG, JPG, WebP
							</p>
						</div>
					</div>
				)}
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) processFile(file);
					}}
				/>
			</div>

			{uploading && (
				<div className="flex flex-col gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
					<div className="flex items-center justify-between text-[11px]">
						<span className="text-slate-600 dark:text-amber-300 font-medium">
							Mengunggah media...
						</span>
						<span className="text-slate-900 dark:text-white font-mono font-bold">
							{uploadProgress}%
						</span>
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
						<div
							className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
							style={{ width: `${uploadProgress}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export function FormNavTabs() {
	const [activeInv, setActiveInv] = useState<{
		title: string;
		template: string;
		slug: string;
	} | null>(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem("aksara-cinta:active-invitation");
			if (raw) {
				setActiveInv(JSON.parse(raw));
			}
		} catch {}
	}, []);

	const tabs = [
		{ to: "/dasbor/template", label: "Template" },
		{ to: "/dasbor/mempelai", label: "1. Mempelai" },
		{ to: "/dasbor/acara", label: "2. Acara" },
		{ to: "/dasbor/galeri", label: "3. Galeri" },
		{ to: "/dasbor/cerita", label: "4. Cerita" },
		{ to: "/dasbor/hadiah", label: "5. Hadiah" },
		{ to: "/dasbor/sebar", label: "6. Sebar" },
	];

	return (
		<div className="space-y-3 mb-6">
			{activeInv && (
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-bold text-amber-900">Aktif:</span>
						<span className="font-bold text-slate-900">{activeInv.title}</span>
						<span className="rounded-full bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
							{activeInv.template}
						</span>
					</div>
					<div className="text-[11px] text-slate-500 font-mono">
						simfonicinta.my.id/undangan/{activeInv.slug}
					</div>
				</div>
			)}

			<div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{tabs.map((tab) => (
					<Link
						key={tab.to}
						to={tab.to}
						activeOptions={{ exact: true }}
						className="shrink-0 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[status=active]:bg-slate-900 data-[status=active]:text-white transition-all cursor-pointer"
					>
						{tab.label}
					</Link>
				))}
			</div>
		</div>
	);
}
