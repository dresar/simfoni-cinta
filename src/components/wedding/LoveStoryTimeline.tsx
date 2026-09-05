import { Heart, Sparkle, Calendar, MapPin } from "@phosphor-icons/react";

type StoryMilestone = {
	year: string;
	title: string;
	location: string;
	description: string;
	photoUrl?: string;
};

export function LoveStoryTimeline({
	milestones = [
		{
			year: "2021",
			title: "Pertemuan Pertama",
			location: "Yogyakarta",
			description:
				"Pertama kali kami bertemu di sebuah kedai kopi di sudut kota Jogja. Senyuman pertama yang membuka gerbang kisah indah ini.",
			photoUrl:
				"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=70",
		},
		{
			year: "2023",
			title: "Menjalin Kasih",
			location: "Bandung",
			description:
				"Kami memutuskan untuk berjalan beriringan, saling mendukung mimpi, dan menjaga komitmen satu sama lain dalam suka maupun duka.",
			photoUrl:
				"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=70",
		},
		{
			year: "2025",
			title: "Momen Lamaran (Engagement)",
			location: "Jakarta",
			description:
				"Di hadapan keluarga besar tercinta, kami mengikat janji suci untuk melangkah ke jenjang pernikahan.",
			photoUrl:
				"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=70",
		},
		{
			year: "2026",
			title: "Hari Bahagia (The Wedding)",
			location: "Jakarta Pusat",
			description:
				"Memulai babak baru kehidupan sebagai sepasang suami istri yang diberkahi cinta dan ridho Ilahi.",
			photoUrl:
				"https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=70",
		},
	],
}: {
	milestones?: StoryMilestone[];
}) {
	return (
		<div className="w-full max-w-3xl mx-auto px-4 py-12">
			{/* Header */}
			<div className="text-center mb-12">
				<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
					<Heart weight="duotone" className="size-3.5 text-danger" />
					Kisah Kasih Kami
				</div>
				<h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
					Perjalanan Cinta
				</h2>
				<p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
					Setiap detik adalah anugerah, setiap langkah adalah kenangan manis
					menuju pelaminan.
				</p>
			</div>

			{/* Timeline Container */}
			<div className="relative border-l-2 border-primary/30 ml-4 sm:ml-32 space-y-10">
				{milestones.map((item, index) => (
					<div key={index} className="relative pl-6 sm:pl-8 group">
						{/* Timeline node dot */}
						<div className="absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-primary bg-card group-hover:bg-primary transition-colors shadow-sm flex items-center justify-center">
							<div className="size-1 rounded-full bg-primary group-hover:bg-white" />
						</div>

						{/* Year Tag on Left (Desktop) */}
						<div className="sm:absolute sm:-left-32 sm:top-1 text-left sm:text-right w-24">
							<span className="font-serif text-lg font-black text-primary">
								{item.year}
							</span>
						</div>

						{/* Story Card */}
						<div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft hover:shadow-lift transition-all">
							{item.photoUrl && (
								<div className="overflow-hidden rounded-2xl mb-4 aspect-[16/9] w-full bg-surface">
									<img
										src={item.photoUrl}
										alt={item.title}
										className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
									/>
								</div>
							)}

							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								<MapPin weight="duotone" className="size-3.5 text-primary" />
								<span>{item.location}</span>
							</div>

							<h3 className="font-serif text-lg font-bold text-foreground mb-2">
								{item.title}
							</h3>

							<p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
								{item.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
