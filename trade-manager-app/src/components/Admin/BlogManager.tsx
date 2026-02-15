import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';
import { BlogEditor } from './BlogEditor';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    category: string;
    published_at: string;
    author: string;
    image_url: string;
    excerpt: string;
    read_time: string;
    content?: string;
}

export const BlogManager: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('published_at', { ascending: false });

        if (data) setPosts(data as BlogPost[]);
        if (error) console.error('Error fetching posts:', error);
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

        const { error } = await supabase.from('blogs').delete().eq('id', id);

        if (error) {
            alert('Error deleting post: ' + error.message);
        } else {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setSelectedPost(null);
        setIsEditing(true);
    };

    const handleCloseEditor = () => {
        setIsEditing(false);
        setSelectedPost(null);
        fetchPosts(); // Refresh list after edit/create
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isEditing) {
        return <BlogEditor post={selectedPost} onClose={handleCloseEditor} />;
    }

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Blog Manager</h1>
                        <p className="text-text-secondary text-sm">Create and manage your trading insights.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-background px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-accent/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Article
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search posts by title or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-light border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder-text-tertiary focus:border-accent outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                    />
                </div>

                {/* Posts List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20 bg-surface-light/30 rounded-2xl border border-white/5">
                        <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No posts found</h3>
                        <p className="text-text-secondary">Get started by creating your first article.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                layoutId={post.id}
                                className="bg-surface-light/30 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-white/10 transition-all group"
                            >
                                {/* Thumbnail */}
                                <div className="w-full md:w-24 h-24 md:h-16 rounded-lg bg-surface-dark overflow-hidden flex-shrink-0">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase rounded-full border border-accent/20">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-text-tertiary">
                                            {new Date(post.published_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate">{post.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-text-secondary">{post.slug}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                    {/* <button className="p-2 text-text-secondary hover:text-white bg-surface-dark hover:bg-white/10 rounded-lg transition-colors" title="View">
                                        <ExternalLink className="w-4 h-4" />
                                    </button> */}
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface-dark hover:bg-white/10 border border-white/5 text-text-secondary hover:text-white rounded-lg transition-all text-sm font-medium"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg transition-all text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
