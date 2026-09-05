import {
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
	type ReactNode,
} from "react";

export type Role = "admin" | "user";

export type Session = {
	name: string;
	email: string;
	role: Role;
	tier: string;
	avatar?: string;
} | null;

export type PricingPackage = {
	id: "bronze" | "silver" | "gold" | "platinum";
	name: string;
	price: number;
	originalPrice?: number;
	badge?: string;
	popular?: boolean;
	features: string[];
	maxPhotos: number | "unlimited";
	maxWaQuota: number | "unlimited";
	activeDuration: string;
	hasLiveStream: boolean;
	hasCustomMusic: boolean;
	hasStoryTimeline: boolean;
	hasCustomDomain: boolean;
};

export const DEFAULT_PACKAGES: PricingPackage[] = [
	{
		id: "silver",
		name: "Paket Silver",
		price: 15000,
		originalPrice: 75000,
		badge: "Hemat",
		popular: false,
		features: [
			"10 Foto Galeri Prewedding",
			"50 Kuota Sebar Undangan WA",
			"Pustaka Musik Platform",
			"Hitung Mundur Acara",
			"Masa Aktif 1 Tahun",
		],
		maxPhotos: 10,
		maxWaQuota: 50,
		activeDuration: "1 Tahun",
		hasLiveStream: false,
		hasCustomMusic: false,
		hasStoryTimeline: false,
		hasCustomDomain: false,
	},
	{
		id: "gold",
		name: "Paket Gold",
		price: 35000,
		originalPrice: 120000,
		badge: "Paling Populer",
		popular: true,
		features: [
			"25 Foto Galeri Prewedding",
			"100 Kuota Sebar Undangan WA",
			"Video Prewedding YouTube",
			"Linimasa Cerita Cinta",
			"Pustaka Musik Lengkap & Kustom",
			"Masa Aktif 3 Tahun",
		],
		maxPhotos: 25,
		maxWaQuota: 100,
		activeDuration: "3 Tahun",
		hasLiveStream: false,
		hasCustomMusic: true,
		hasStoryTimeline: true,
		hasCustomDomain: false,
	},
	{
		id: "platinum",
		name: "Paket Platinum",
		price: 75000,
		originalPrice: 250000,
		badge: "Fitur Terlengkap",
		popular: false,
		features: [
			"Foto Galeri Unlimited",
			"Sebar WA Unlimited Blast",
			"Live Streaming YouTube/IG",
			"Pustaka Musik & Kustom MP3",
			"Linimasa Cerita Cinta Lengkap",
			"Domain Kustom / Subdomain Khusus",
			"Masa Aktif Selamanya",
		],
		maxPhotos: "unlimited",
		maxWaQuota: "unlimited",
		activeDuration: "Selamanya",
		hasLiveStream: true,
		hasCustomMusic: true,
		hasStoryTimeline: true,
		hasCustomDomain: true,
	},
];

type StoreContextValue = {
	session: Session;
	packages: PricingPackage[];
	isLoaded: boolean;
	signIn: (session: NonNullable<Session>) => void;
	signOut: () => void;
	setSession: (session: Session) => void;
	updatePackage: (
		id: "silver" | "gold" | "platinum",
		updated: Partial<PricingPackage>,
	) => void;
	resetPackages: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
	const [session, setSessionState] = useState<Session>(null);
	const [packages, setPackagesState] = useState<PricingPackage[]>(DEFAULT_PACKAGES);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		try {
			const savedSession = localStorage.getItem("aksc_session");
			if (savedSession) {
				const parsed = JSON.parse(savedSession);
				if (
					parsed &&
					typeof parsed === "object" &&
					parsed.email &&
					parsed.role
				) {
					setSessionState(parsed);
				}
			}
			const savedPackages = localStorage.getItem("aksc_packages");
			if (savedPackages) {
				setPackagesState(JSON.parse(savedPackages));
			}
		} catch {} finally {
			setIsLoaded(true);
		}
	}, []);

	const setSession = (s: Session) => {
		setSessionState(s);
		if (typeof window !== "undefined") {
			if (s) {
				localStorage.setItem("aksc_session", JSON.stringify(s));
			} else {
				localStorage.removeItem("aksc_session");
			}
		}
	};

	const updatePackage = (
		id: "silver" | "gold" | "platinum",
		updated: Partial<PricingPackage>,
	) => {
		setPackagesState((prev) => {
			const next = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
			if (typeof window !== "undefined") {
				localStorage.setItem("aksc_packages", JSON.stringify(next));
			}
			return next;
		});
	};

	const resetPackages = () => {
		setPackagesState(DEFAULT_PACKAGES);
		if (typeof window !== "undefined") {
			localStorage.setItem("aksc_packages", JSON.stringify(DEFAULT_PACKAGES));
		}
	};

	const value = useMemo<StoreContextValue>(
		() => ({
			session,
			packages,
			isLoaded,
			signIn: (s) => setSession(s),
			signOut: () => setSession(null),
			setSession,
			updatePackage,
			resetPackages,
		}),
		[session, packages, isLoaded],
	);

	return (
		<StoreContext.Provider value={value}>{children}</StoreContext.Provider>
	);
}

export function useStore() {
	const context = useContext(StoreContext);
	if (!context) throw new Error("StoreProvider missing");
	return context;
}

export function createId(prefix: string) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
