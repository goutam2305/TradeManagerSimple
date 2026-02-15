import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Search, TrendingUp, Star, LayoutGrid, BookOpen, Zap, Award } from 'lucide-react';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image_url: string;
    category: string;
    published_at: string;
    read_time: string;
    author: string;
    is_featured?: boolean;
}

interface BlogIndexProps {
    onOpenPost: (slug: string) => void;
    onBack: () => void;
}

export const BlogIndex: React.FC<BlogIndexProps> = ({ onOpenPost, onBack }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All articles');

    // Mapped categories to match reference
    const categories = [
        { name: 'All articles', icon: LayoutGrid },
        { name: 'Interesting', icon: Star },
        { name: 'Strategy', icon: TrendingUp },
        { name: 'Insights', icon: BookOpen },
        { name: 'Updates', icon: Zap },
        { name: 'QX Academy', icon: Award },
    ];

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .order('published_at', { ascending: false });

            if (data) {
                setPosts(data as BlogPost[]);
            }
            if (error) console.error('Error loading posts:', error);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    const featuredPost = posts[0];
    const topArticles = posts.slice(1, 4);

    // Filter posts for the grid
    const gridPosts = activeCategory === 'All articles'
        ? posts.slice(4)
        : posts.filter(p => p.category === activeCategory);

    const filteredGridPosts = gridPosts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* LEFT SIDEBAR - TOPICS */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {/* Back Button */}
                            <button
                                onClick={onBack}
                                className="text-xs font-bold text-text-secondary hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest mb-6"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to Home
                            </button>

                            {/* Topics Menu */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-4 px-3">Topics</h3>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setActiveCategory(cat.name)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${activeCategory === cat.name
                                                ? 'bg-accent/10 text-accent'
                                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <cat.icon className={`w-4 h-4 ${activeCategory === cat.name ? 'text-accent' : 'text-text-tertiary group-hover:text-white'}`} />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* CTA Card */}
                            <div className="bg-gradient-to-br from-surface-light to-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-all" />
                                <h4 className="text-lg font-bold text-white mb-2 relative z-10">Demo Account</h4>
                                <p className="text-xs text-text-secondary mb-6 relative z-10 leading-relaxed">
                                    Test your strategies risk-free with $10,000 virtual funds.
                                </p>
                                <div className="space-y-3 relative z-10">
                                    <button className="w-full py-2.5 bg-accent hover:bg-accent-hover text-background text-xs font-black rounded-lg transition-all uppercase tracking-wide">
                                        Try Demo
                                    </button>
                                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-lg transition-all uppercase tracking-wide">
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT Area */}
                    <div className="flex-1 min-w-0">

                        {/* HERO SECTION only visible on 'All articles' or if we want it everywhere? Reference usually has it on Home */}
                        {activeCategory === 'All articles' && (
                            <div className="grid lg:grid-cols-3 gap-8 mb-16">
                                {/* Main Featured Post */}
                                {featuredPost && (
                                    <div className="lg:col-span-2 group cursor-pointer" onClick={() => onOpenPost(featuredPost.slug)}>
                                        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 relative bg-surface-light border border-white/5">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500" />
                                            <img
                                                src={featuredPost.image_url || '/placeholder-blog.jpg'}
                                                alt={featuredPost.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 text-[10px] font-black bg-accent text-background rounded-full uppercase tracking-wide">
                                                    Featured
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-xs text-text-tertiary">
                                                <span className="text-accent font-bold uppercase tracking-wider">{featuredPost.category}</span>
                                                <span className="w-1 h-1 bg-text-tertiary rounded-full" />
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(featuredPost.published_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <h2 className="text-3xl font-bold text-white group-hover:text-accent transition-colors leading-tight">
                                                {featuredPost.title}
                                            </h2>
                                            <p className="text-text-secondary text-base line-clamp-2 leading-relaxed">
                                                {featuredPost.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Top Articles Sidebar (Right of Featured) */}
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                        <input
                                            type="text"
                                            placeholder="Search articles..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-surface-light/50 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-text-tertiary focus:border-accent outline-none focus:ring-1 focus:ring-accent/50 transition-all backdrop-blur-sm"
                                        />
                                    </div>

                                    <div className="bg-surface-light/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                                        <h3 className="text-sm font-black text-white flex items-center gap-2 mb-6 uppercase tracking-wider">
                                            <TrendingUp className="w-4 h-4 text-accent" />
                                            Top Articles
                                        </h3>
                                        <div className="space-y-6">
                                            {topArticles.map((post) => (
                                                <div key={post.id} className="flex gap-4 group cursor-pointer" onClick={() => onOpenPost(post.slug)}>
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-dark">
                                                        <img
                                                            src={post.image_url || '/placeholder-blog.jpg'}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5">
                                                        <span className="text-[10px] font-bold text-accent uppercase tracking-wide block mb-1.5">
                                                            {post.category}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                                                            {post.title}
                                                        </h4>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CATEGORY GRID */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wide">
                                    <span className="w-1.5 h-6 bg-accent rounded-full" />
                                    {activeCategory === 'All articles' ? 'Latest Updates' : activeCategory}
                                </h2>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredGridPosts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => onOpenPost(post.slug)}
                                            className="group cursor-pointer flex flex-col h-full bg-surface-light/30 border border-white/5 rounded-xl overflow-hidden hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5"
                                        >
                                            <div className="aspect-[4/3] overflow-hidden relative bg-surface-dark">
                                                <img
                                                    src={post.image_url || '/placeholder-blog.jpg'}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                                                    {post.read_time}
                                                </div>
                                            </div>

                                            <div className="p-4 flex flex-col flex-grow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-black text-accent uppercase tracking-wider">
                                                        {post.category}
                                                    </span>
                                                    <span className="text-[10px] text-text-tertiary font-medium">
                                                        {new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors line-clamp-2 leading-relaxed mb-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-xs text-text-secondary line-clamp-2 mt-auto">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
