import React, { useState } from 'react';
import { Play, Youtube, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoPageProps {
    onBack: () => void;
    onGetStarted: () => void;
}

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    tags: string[];
    youtubeId: string;
}

const DEMO_VIDEOS: Video[] = [
    {
        id: '1',
        title: "Binary Options Mastery - Strategy #1",
        description: "Explore advanced binary options trading strategies. Learn how to identify high-probability entries and manage your risk effectively.",
        thumbnail: "https://img.youtube.com/vi/qkXM6bgp8dE/maxresdefault.jpg",
        duration: "18:32",
        tags: ["Strategy", "Mastery"],
        youtubeId: "qkXM6bgp8dE"
    },
    {
        id: '2',
        title: "Professional Trading Insights - Part 2",
        description: "Deep dive into market psychology and advanced indicator combinations for consistent profitability in binary markets.",
        thumbnail: "https://img.youtube.com/vi/3DBpfB0ao50/maxresdefault.jpg",
        duration: "22:15",
        tags: ["Insights", "Advanced"],
        youtubeId: "3DBpfB0ao50"
    },
    {
        id: '3',
        title: "Platform Walkthrough & Live Execution",
        description: "Watch the platform in action. From setup to trade execution, see how TradeFlow streamlines your trading workflow.",
        thumbnail: "https://img.youtube.com/vi/Kz3kZOTd_tI/maxresdefault.jpg",
        duration: "16:48",
        tags: ["Walkthrough", "Live"],
        youtubeId: "Kz3kZOTd_tI"
    }
];

export const DemoPage: React.FC<DemoPageProps> = ({ onGetStarted }) => {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    return (
        <div className="relative">
            {/* Content */}
            <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Ambient Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
                    <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
                    <div className="absolute top-[30%] right-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative text-center mb-20 space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Youtube className="w-4 h-4" />
                        Demo
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-glow uppercase font-heading">
                        TRADING <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-accent bg-[length:200%_auto] animate-gradient">INSIGHTS</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium mb-10">
                        Explore our platform capabilities through high-quality training and demonstration videos.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 rounded-2xl bg-accent hover:bg-accent-hover text-background font-black text-xl transition-all hover:scale-105 shadow-xl hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] animate-pulse-glow uppercase tracking-widest"
                    >
                        Get Started Now — It's Free
                    </button>


                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {DEMO_VIDEOS.map((video, index) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-accent/20 to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative premium-glass rounded-[2rem] overflow-hidden hover:border-accent/40 transition-all hover:-translate-y-2 flex flex-col h-full cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                {/* Thumbnail */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                                            <Play className="w-6 h-6 text-white fill-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {video.duration}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {video.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight leading-tight group-hover:text-accent transition-colors font-heading">{video.title}</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed mb-8 flex-1 font-medium">{video.description}</p>

                                    <button
                                        className="bg-surface hover:bg-white/5 text-white/70 hover:text-white px-6 py-4 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 group/btn border border-white/5 hover:border-accent/30 uppercase tracking-widest"
                                    >
                                        Watch Full Demo
                                        <Play className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-32 p-16 rounded-[3rem] bg-gradient-to-b from-surface to-background border border-white/5 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 font-heading">Ready to start trading?</h2>
                        <p className="text-xl text-text-secondary mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                            Join 15,000+ traders who have optimized their profitability using TradeFlow's institutional tools.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="px-12 py-5 rounded-2xl bg-accent hover:bg-accent-hover text-background font-black text-xl transition-all hover:scale-105 relative z-10 shadow-xl hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] animate-pulse-glow uppercase tracking-widest"
                        >
                            Get Started Now — It's Free
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                            onClick={() => setSelectedVideo(null)}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl aspect-video bg-surface rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Embed */}
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                                title={selectedVideo.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
