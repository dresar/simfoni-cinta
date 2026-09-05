import { useState, useEffect } from "react";
import {
	CalendarPlus,
	Clock,
	Sparkle,
	GoogleLogo,
	MicrosoftOutlookLogo,
	Calendar,
} from "@phosphor-icons/react";

export function CountdownCalendar({
	targetDate = "2026-10-24T09:00:00+07:00",
	eventTitle = "The Wedding of Bagas & Nindya",
	eventLocation = "Grand Ballroom Hotel Indonesia Kempinski, Jakarta Pusat",
	eventDescription = "Akad Nikah & Resepsi Pernikahan Bagas Pratama & Nindya Ayu Larasati.",
}: {
	targetDate?: string;
	eventTitle?: string;
	eventLocation?: string;
	eventDescription?: string;
}) {
	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		const calculateTime = () => {
			const difference = new Date(targetDate).getTime() - new Date().getTime();
			if (difference > 0) {
				setTimeLeft({
					days: Math.floor(difference / (1000 * 60 * 60 * 24)),
					hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
					minutes: Math.floor((difference / 1000 / 60) % 60),
					seconds: Math.floor((difference / 1000) % 60),
				});
			}
		};

		calculateTime();
		const timer = setInterval(calculateTime, 1000);
		return () => clearInterval(timer);
	}, [targetDate]);

	const generateGoogleCalendarUrl = () => {
		const startIso = new Date(targetDate)
			.toISOString()
			.replace(/-|:|\.\d\d\d/g, "");
		const endDate = new Date(
			new Date(targetDate).getTime() + 4 * 60 * 60 * 1000,
		);
		const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
			eventTitle,
		)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
			eventDescription,
		)}&location=${encodeURIComponent(eventLocation)}`;
	};

	const downloadIcsFile = () => {
		const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Simfoni Cinta//Wedding Invitation//ID
BEGIN:VEVENT
SUMMARY:${eventTitle}
DESCRIPTION:${eventDescription}
LOCATION:${eventLocation}
DTSTART:${new Date(targetDate).toISOString().replace(/-|:|\.\d\d\d/g, "")}
DTEND:${new Date(new Date(targetDate).getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

		const blob = new Blob([icsContent], {
			type: "text/calendar;charset=utf-8",
		});
		const link = document.createElement("a");
		link.href = window.URL.createObjectURL(blob);
		link.setAttribute("download", "wedding-invitation.ics");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
			{/* Header */}
			<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
				<Clock weight="duotone" className="size-3.5" />
				Menuju Hari Bahagia
			</div>
			<h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
				Hitung Mundur Acara
			</h2>
			<p className="text-sm text-muted-foreground mt-1">
				Sabtu, 24 Oktober 2026 · Pukul 09.00 WIB
			</p>

			{/* Countdown Digits Grid */}
			<div className="grid grid-cols-4 gap-3 sm:gap-4 my-8 max-w-lg mx-auto">
				{[
					{ label: "HARI", value: timeLeft.days },
					{ label: "JAM", value: timeLeft.hours },
					{ label: "MENIT", value: timeLeft.minutes },
					{ label: "DETIK", value: timeLeft.seconds },
				].map((item, index) => (
					<div
						key={index}
						className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-soft flex flex-col items-center justify-center hover:shadow-lift transition-all"
					>
						<span className="font-serif text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
							{String(item.value).padStart(2, "0")}
						</span>
						<span className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
							{item.label}
						</span>
					</div>
				))}
			</div>

			{/* Add To Calendar Action Buttons */}
			<div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
				<a
					href={generateGoogleCalendarUrl()}
					target="_blank"
					rel="noreferrer"
					className="py-2.5 px-4 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
				>
					<GoogleLogo weight="bold" className="size-4 text-primary" />
					Simpan ke Google Calendar
				</a>

				<button
					onClick={downloadIcsFile}
					className="py-2.5 px-4 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
				>
					<Calendar weight="duotone" className="size-4 text-gold" />
					Apple / Outlook (.ics)
				</button>
			</div>
		</div>
	);
}
