import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, User, Twitter, Linkedin, Facebook } from 'lucide-react';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    content: string;
    image_url: string;
    category: string;
    published_at: string;
    read_time: string;
    author: string;
}

interface BlogPostProps {
    slug: string;
    onBack: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ slug, onBack }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .eq('slug', slug)
                .single();

            if (data) setPost(data as BlogPost);
            if (error) console.error('Error loading post:', error);
            setLoading(false);
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center items-center text-center p-4">
                <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
                <button onClick={onBack} className="text-accent hover:underline">Return to Blog</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            {/* Hero Image with Overlay */}
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                <button
                    onClick={onBack}
                    className="mb-8 text-sm text-text-secondary hover:text-white flex items-center gap-2 transition-colors group"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-2xl overflow-hidden aspect-[21/9] mb-10 shadow-2xl border border-white/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
                    <img
                        src={post.image_url || '/placeholder-blog.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 left-6 z-20">
                        <span className="px-3 py-1 text-xs font-bold bg-accent/90 text-background rounded-full mb-3 inline-block">
                            {post.category}
                        </span>
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-text-tertiary">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center border border-white/10">
                                <User className="w-4 h-4 text-accent" />
                            </div>
                            <span className="font-medium text-text-secondary">{post.author || 'Trade Manager Team'}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.read_time}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="prose prose-invert prose-lg max-w-none 
                        prose-headings:text-white prose-headings:font-bold 
                        prose-p:text-text-secondary prose-p:leading-relaxed 
                        prose-li:text-text-secondary
                        prose-strong:text-white prose-strong:font-semibold
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-accent prose-blockquote:bg-surface-light/30 prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                        prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-white/5"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Footer Share */}
                <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
                    <span className="text-text-tertiary font-medium">Share this article</span>
                    <div className="flex gap-4">
                        <button className="p-2 rounded-full bg-surface-light hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
                            <Twitter className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full bg-surface-light hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full bg-surface-light hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
                            <Facebook className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
