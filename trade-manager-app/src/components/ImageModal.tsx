import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
}

export const ImageModal = ({ isOpen, onClose, imageUrl }: ImageModalProps) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
                >
                    <div className="relative pointer-events-auto">
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={imageUrl}
                            alt="Trade Evidence"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10 bg-surface"
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
