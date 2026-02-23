import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PhotoCarouselProps {
    photos: string[];
    initialIndex?: number;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (photos.length === 0) return null;

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="relative w-full h-96 bg-slate-100">
            <img
                src={photos[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                className="w-full h-full object-cover"
            />
            
            {photos.length > 1 && (
                <>
                    <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
                        📷 {currentIndex + 1} / {photos.length}
                    </div>

                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'bg-white w-6'
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

interface PhotoModalProps {
    photos: string[];
    initialIndex: number;
    onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photos, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, []);

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm"
                aria-label="Закрыть"
            >
                <X className="w-7 h-7" />
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
                <img
                    src={photos[currentIndex]}
                    alt={`Фото ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                />

                {photos.length > 1 && (
                    <>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-5 py-2.5 rounded-full text-base font-semibold backdrop-blur-sm">
                            {currentIndex + 1} / {photos.length}
                        </div>

                        <button
                            onClick={goToPrevious}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                            aria-label="Предыдущее фото"
                        >
                            <ChevronLeft className="w-9 h-9" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                            aria-label="Следующее фото"
                        >
                            <ChevronRight className="w-9 h-9" />
                        </button>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                            {photos.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(index);
                                    }}
                                    className={`h-3 rounded-full transition-all ${
                                        index === currentIndex
                                            ? 'bg-white w-10'
                                            : 'bg-white/50 hover:bg-white/75 w-3'
                                    }`}
                                    aria-label={`Перейти к фото ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
