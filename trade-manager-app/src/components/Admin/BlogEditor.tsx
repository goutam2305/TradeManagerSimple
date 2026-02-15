import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import {
    ArrowLeft, Save, Image as ImageIcon, Loader2,
    Bold, Italic, List, Heading1, Heading2, Eye, EyeOff,
    Quote, Code, Link as LinkIcon, SplitSquareHorizontal,
    Undo, Redo
} from 'lucide-react';

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
    content?: string;
}

interface BlogEditorProps {
    post: BlogPost | null;
    onClose: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ post, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [category, setCategory] = useState(post?.category || 'Insights');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [content, setContent] = useState(post?.content || '');
    const [imageUrl, setImageUrl] = useState(post?.image_url || '');
    const [readTime, setReadTime] = useState(post?.read_time || '5 min');
    const [author, setAuthor] = useState(post?.author || 'Admin');

    const categories = ['All articles', 'Interesting', 'Strategy', 'Insights', 'Updates', 'QX Academy'];

    // History State for Undo/Redo
    const [history, setHistory] = useState<string[]>([post?.content || '']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const isHistoryAction = useRef(false);

    // Auto-Save / Restore
    const draftKey = `blog_draft_${post?.id || 'new'}`;

    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft && !post) {
            try {
                const draft = JSON.parse(savedDraft);
                if (window.confirm('Found an unsaved draft. Do you want to restore it?')) {
                    setTitle(draft.title || '');
                    setContent(draft.content || '');
                    setExcerpt(draft.excerpt || '');
                    if (draft.category) setCategory(draft.category);
                    if (draft.slug) setSlug(draft.slug);
                    if (draft.read_time) setReadTime(draft.read_time);
                    if (draft.author) setAuthor(draft.author);
                    if (draft.image_url) setImageUrl(draft.image_url);
                }
            } catch (e) {
                console.error('Error parsing draft', e);
            }
        }
    }, []);

    // Save Draft Effect
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify({
                title, content, excerpt, category, slug, author, read_time: readTime, image_url: imageUrl
            }));
        }, 1000);
        return () => clearTimeout(timeout);
    }, [title, content, excerpt, category, slug, author, readTime, imageUrl]);

    // History Effect
    useEffect(() => {
        if (isHistoryAction.current) {
            isHistoryAction.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            if (content !== history[historyIndex]) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(content);
                // Limit history size to 50 steps
                if (newHistory.length > 50) newHistory.shift();

                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
        }, 700); // 700ms debounce

        return () => clearTimeout(timeout);
    }, [content]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!post && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, post]);

    const performUndo = () => {
        if (historyIndex > 0) {
            isHistoryAction.current = true;
            const prevContent = history[historyIndex - 1];
            setContent(prevContent);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const performRedo = () => {
        if (historyIndex < history.length - 1) {
            isHistoryAction.current = true;
            const nextContent = history[historyIndex + 1];
            setContent(nextContent);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const insertAtCursor = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);

        // Restore focus and cursor position (roughly)
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) performRedo();
                    else performUndo();
                    break;
                case 'y':
                    e.preventDefault();
                    performRedo();
                    break;
                case 'b':
                    e.preventDefault();
                    handleToolbarClick('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    handleToolbarClick('italic');
                    break;
                case 's':
                    e.preventDefault();
                    handleSave(e as any);
                    break;
            }
        }
    };

    const handleToolbarClick = (action: string) => {
        switch (action) {
            case 'bold': insertAtCursor('<b>', '</b>'); break;
            case 'italic': insertAtCursor('<i>', '</i>'); break;
            case 'h2': insertAtCursor('<h2>', '</h2>'); break;
            case 'h3': insertAtCursor('<h3>', '</h3>'); break;
            case 'ul': insertAtCursor('<ul>\n  <li>', '</li>\n</ul>'); break;
            case 'quote': insertAtCursor('<blockquote>', '</blockquote>'); break;
            case 'code': insertAtCursor('<code>', '</code>'); break;
            case 'link': insertAtCursor('<a href="url">', '</a>'); break;
            case 'image': fileInputRef.current?.click(); break; // Trigger hidden file input
            case 'undo': performUndo(); break;
            case 'redo': performRedo(); break;
        }
    };

    const handleFeatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        await uploadImage(file, setImageUrl);
    };

    const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Callback to insert image tag at cursor
        await uploadImage(file, (url) => {
            insertAtCursor(`<img src="${url}" alt="Image" className="w-full rounded-xl my-4" />`);
        });
    };

    const uploadImage = async (file: File, callback: (url: string) => void) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
            callback(data.publicUrl);
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const postData = {
            title,
            slug,
            category,
            excerpt,
            content,
            image_url: imageUrl,
            read_time: readTime,
            author,
            published_at: post?.published_at || new Date().toISOString(),
        };

        try {
            if (post) {
                const { error } = await supabase
                    .from('blogs')
                    .update(postData)
                    .eq('id', post.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blogs')
                    .insert([postData]);
                if (error) throw error;
            }
            onClose();
        } catch (error: any) {
            alert('Error saving post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0B0E14] overflow-y-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-white hidden md:block">
                        {post ? 'Edit Article' : 'New Article'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isPreview
                            ? 'bg-accent/10 text-accent border border-accent/20'
                            : 'bg-surface-light border border-white/5 text-text-secondary hover:text-white'
                            }`}
                    >
                        {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreview ? 'Edit Mode' : 'Preview'}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-background px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {post ? 'Update' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Editor Area */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Title Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-4xl font-black text-white placeholder:text-white/40 outline-none border-none p-0"
                        placeholder="Article Title..."
                    />

                    {/* Excerpt */}
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-xl text-text-secondary placeholder:text-white/20 outline-none border-none p-0 resize-none font-medium"
                        placeholder="Write a short summary or excerpt..."
                    />

                    {/* Editor / Preview Container */}
                    <div className="glass-panel min-h-[600px] flex flex-col rounded-2xl overflow-hidden border border-white/5 relative">

                        {/* Toolbar (Only in Edit Mode) */}
                        {!isPreview && (
                            <div className="bg-surface-light/50 border-b border-white/5 p-2 flex items-center gap-1 sticky top-0 z-10 backdrop-blur-md overflow-x-auto no-scrollbar">
                                <ToolbarBtn icon={Bold} onClick={() => handleToolbarClick('bold')} label="Bold" />
                                <ToolbarBtn icon={Italic} onClick={() => handleToolbarClick('italic')} label="Italic" />
                                <div className="w-px h-6 bg-white/10 mx-2" />
                                <ToolbarBtn icon={Heading1} onClick={() => handleToolbarClick('h2')} label="H2" />
                                <ToolbarBtn icon={Heading2} onClick={() => handleToolbarClick('h3')} label="H3" />
                                <ToolbarBtn icon={Quote} onClick={() => handleToolbarClick('quote')} label="Quote" />
                                <div className="w-px h-6 bg-white/10 mx-2" />
                                <ToolbarBtn icon={List} onClick={() => handleToolbarClick('ul')} label="List" />
                                <ToolbarBtn icon={Code} onClick={() => handleToolbarClick('code')} label="Code" />
                                <div className="w-px h-6 bg-white/10 mx-2" />
                                <ToolbarBtn icon={LinkIcon} onClick={() => handleToolbarClick('link')} label="Link" />
                                <ToolbarBtn icon={ImageIcon} onClick={() => handleToolbarClick('image')} label="Insert Image" />
                                <div className="w-px h-6 bg-white/10 mx-2" />
                                <ToolbarBtn icon={Undo} onClick={() => handleToolbarClick('undo')} label="Undo (Ctrl+Z)" />
                                <ToolbarBtn icon={Redo} onClick={() => handleToolbarClick('redo')} label="Redo (Ctrl+Y)" />
                                {/* Hidden Input for Inline Image */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleInlineImageUpload}
                                />
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 bg-surface-dark/30 relative">
                            {isPreview ? (
                                <div
                                    className="prose prose-invert prose-lg max-w-none p-8"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            ) : (
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full h-full bg-transparent p-8 text-white text-lg leading-relaxed outline-none resize-none font-mono"
                                    placeholder="Start writing your amazing story..."
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-6 space-y-6 rounded-2xl sticky top-24">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <SplitSquareHorizontal className="w-5 h-5 text-accent" />
                            Post Settings
                        </h3>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full input-field px-4 py-3 text-sm focus:border-accent outline-none appearance-none cursor-pointer"
                            >
                                {categories.map(c => <option key={c} value={c} className="bg-surface-dark text-white">{c}</option>)}
                            </select>
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full input-field px-4 py-3 text-sm focus:border-accent outline-none font-mono"
                            />
                        </div>

                        {/* Read Time */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Read Time</label>
                            <input
                                type="text"
                                value={readTime}
                                onChange={(e) => setReadTime(e.target.value)}
                                className="w-full input-field px-4 py-3 text-sm focus:border-accent outline-none"
                            />
                        </div>

                        {/* Author */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Author</label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full input-field px-4 py-3 text-sm focus:border-accent outline-none"
                            />
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Featured Image</label>
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFeatureImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading}
                                />
                                <div className={`w-full aspect-video rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center transition-all overflow-hidden ${imageUrl ? 'bg-surface-dark' : 'bg-white/5 hover:bg-white/10'}`}>
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                    ) : imageUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={imageUrl} alt="Featured" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-text-tertiary group-hover:text-accent transition-colors">
                                            <ImageIcon className="w-8 h-8" />
                                            <span className="text-xs font-medium">Upload Cover</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick, label }: { icon: any, onClick: () => void, label: string }) => (
    <button
        onClick={onClick}
        title={label}
        className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all"
    >
        <Icon className="w-4 h-4" />
    </button>
);
