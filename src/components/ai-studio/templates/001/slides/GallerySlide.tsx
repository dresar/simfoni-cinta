import React from "react";
import type { AssetSlots } from "../../../types";

interface GallerySlideProps {
	assets: AssetSlots;
	slideAnimClass: string;
	ornaments: React.ReactNode;
}

export function GallerySlide({
	assets,
	slideAnimClass,
	ornaments,
}: GallerySlideProps) {
	return (
		<div className={`relative h-full w-full flex flex-col justify-between p-4 overflow-y-auto no-scrollbar pb-16 ${slideAnimClass}`}>
			{ornaments}

			<div className="w-full pt-8 text-center z-10 animate-stagger-up">
				<span className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold">
					Dokumentasi
				</span>
				<h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
					Galeri Bahagia
				</h2>
			</div>

			<div className="w-full max-w-[285px] sm:max-w-[310px] mx-auto z-10 my-auto grid grid-cols-2 gap-2">
				<div className="col-span-2 rounded-xl overflow-hidden border border-white/20 aspect-16/9 shadow-lg animate-image-from-left">
					<img
						src={assets.couplePhoto || assets.galleryPhotos[0]}
						alt="Gallery Utama"
						className="w-full h-full object-cover"
					/>
				</div>
				{assets.galleryPhotos.slice(0, 4).map((photo, idx) => (
					<div
						key={idx}
						className={`rounded-xl overflow-hidden border border-white/20 aspect-square shadow-md ${
							idx % 2 === 0 ? "animate-image-from-left" : "animate-image-from-right"
						}`}
					>
						<img
							src={photo}
							alt={`Gallery ${idx + 1}`}
							className="w-full h-full object-cover"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
