import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form'; 
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, Globe, ArrowLeft, Eye, X, Upload } from 'lucide-react';
import { cmsService } from '../../../services/cmsService';
import { useToast } from '../../../components/ui/Toast';
import { QuillEditor } from './QuillEditor';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { Badge } from '../../../components/ui/Badge';
import { CreatableSelect } from '../../../components/ui/CreatableSelect';

export function CMSEditorPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form for SEO metadata
    const seoForm = useForm({
        initialValues: {
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            og_image_url: '',
            category: 'Startups',
            excerpt: '',
            author_name: '',
            author_image: '',
            read_time: '1 min read',
            tags: [],
            subtitle: ''
        }
    });

    useEffect(() => {
        if (page?.draft_content) {
            const text = typeof page.draft_content === 'string' 
                ? page.draft_content.replace(/<[^>]*>/g, '') 
                : JSON.stringify(page.draft_content).replace(/<[^>]*>/g, '');
            const wordsPerMinute = 200;
            const words = text.split(/\s+/).length;
            const minutes = Math.ceil(words / wordsPerMinute);
            const newReadTime = `${minutes} min read`;
            
            if (seoForm.values.read_time !== newReadTime) {
                seoForm.setFieldValue('read_time', newReadTime);
            }
        }
    }, [page?.draft_content, seoForm]); // seoForm is stable from useForm

    const isLoaded = React.useRef(null); // Track which slug we have loaded
    const isFetching = React.useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug || slug === 'new' || isFetching.current || isLoaded.current === slug) return;
            
            console.group(`[DEBUG] CMSEditorPage: Fetching data for ${slug}`);
            console.log("Current state:", { loading, hasPage: !!page, isLoaded: isLoaded.current });
            
            try {
                isFetching.current = true;
                setLoading(true);

                // Find the page ID by slug
                const pages = await cmsService.getPages();
                const found = pages.find(p => p.slug === slug);
                
                if (!found) {
                    console.warn("Page not found in list");
                    addToast('Blog post not found', 'error');
                    navigate('/admin/communication/cms/blogs');
                    return;
                }

                console.log(`Fetching admin details for ID: ${found.id}`);
                const fullPage = await cmsService.getPageAdmin(found.id);
                
                // Batch updates
                setPage(fullPage);
                seoForm.setValues({
                    seo_title: fullPage.seo_title || '',
                    seo_description: fullPage.seo_description || '',
                    seo_keywords: fullPage.seo_keywords || '',
                    og_image_url: fullPage.og_image_url || '',
                    category: fullPage.category || '',
                    excerpt: fullPage.excerpt || '',
                    author_name: fullPage.author_name || '',
                    author_image: fullPage.author_image || '',
                    read_time: fullPage.read_time || '',
                    tags: fullPage.tags || [],
                    subtitle: fullPage.subtitle || ''
                });
                
                isLoaded.current = slug;
                console.log("Data loaded successfully");
            } catch (err) {
                console.error('Error loading page details:', err);
                addToast('Error loading page', 'error');
            } finally {
                setLoading(false);
                isFetching.current = false;
                console.groupEnd();
            }
        };

        fetchData();
    }, [slug, addToast, navigate, seoForm]); // These are now all stable.

    // Helper for manual refresh if needed (e.g. after publish)
    const loadPage = useCallback(async () => {
        isLoaded.current = null; // Force reload
        // The useEffect will catch this change if we trigger a re-render
        setLoading(true); 
    }, []);

    const handleSaveDraft = async () => {
        if (!page) return;
        setSaving(true);
        try {
            await cmsService.updateDraft(page.id, {
                ...page, // draft_content should be updated in state
                ...seoForm.values
            });
            addToast('Draft saved successfully', 'success');
        } catch (err) {
            console.error(err);
            addToast('Error saving draft', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!page) return;
        if (!confirm('Are you sure you want to publish these changes live?')) return;
        
        try {
            await handleSaveDraft();
            await cmsService.publishPage(page.id);
            addToast('Page published successfully!', 'success');
            loadPage();
        } catch (err) {
            console.error(err);
            addToast('Error publishing page', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading editor...</div>;
    if (!page) return <div className="p-8 text-center">Page not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary dark:text-white">
                            Editing: {page.title}
                        </h1>
                        <span className="text-xs text-text-tertiary">
                            Status: <span className={page.status === 'published' ? 'text-green-500' : 'text-amber-500'}>{page.status}</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => window.open(`/${page.slug}?preview=true&id=${page.id}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                    <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" /> Save Draft
                    </Button>
                    <Button variant="primary" onClick={handlePublish}>
                        <Globe className="h-4 w-4 mr-2" /> Publish Live
                    </Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Compact Version */}
                <div className="w-80 border-l border-border-light dark:border-border-dark bg-white dark:bg-surface-dark overflow-y-auto order-last">
                    <div className="p-6 space-y-10">
                        
                        {/* Publication Status */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Publication</h3>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-background-dark border border-border-light dark:border-border-dark space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-text-secondary">Current Status</span>
                                    <Badge variant={page.status === 'published' ? 'success' : 'neutral'}>
                                        {page.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-text-secondary">Read Time</span>
                                    <span className="text-xs font-bold text-text-primary dark:text-white">{seoForm.values.read_time}</span>
                                </div>
                                <Button variant="primary" className="w-full text-xs h-9" onClick={handlePublish}>
                                    {page.status === 'published' ? 'Update Live Post' : 'Publish Post Now'}
                                </Button>
                            </div>
                        </div>

                        {/* Categorization */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Categorization</h3>
                            <div className="space-y-5">
                                <Input 
                                    label="Category" 
                                    placeholder="e.g. Engineering"
                                    {...seoForm.getInputProps('category')}
                                />
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-text-secondary">Tags</label>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {seoForm.values.tags.map(tag => (
                                            <Badge key={tag} variant="neutral" className="pl-2 pr-1 py-0.5 gap-1 text-[10px] font-bold uppercase tracking-wider">
                                                {tag}
                                                <button 
                                                    onClick={() => seoForm.setFieldValue('tags', seoForm.values.tags.filter(t => t !== tag))}
                                                    className="hover:text-error transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <input 
                                        className="w-full h-9 rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Add tag and press Enter..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                if (!seoForm.values.tags.includes(e.target.value.trim())) {
                                                    seoForm.setFieldValue('tags', [...seoForm.values.tags, e.target.value.trim()]);
                                                }
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Featured Image</h3>
                            <ImageUpload 
                                value={seoForm.values.og_image_url} 
                                onChange={(file) => {
                                    if (file) {
                                        cmsService.uploadMedia(file).then(res => {
                                            seoForm.setFieldValue('og_image_url', res.url);
                                        });
                                    }
                                }} 
                                aspect={16/9}
                                className="w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary/30 transition-colors"
                            />
                        </div>

                        {/* SEO Settings */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Search Optimization</h3>
                            <div className="space-y-4">
                                <Input 
                                    label="SEO Title" 
                                    placeholder="Search engine title..."
                                    {...seoForm.getInputProps('seo_title')}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary">Meta Description</label>
                                    <textarea 
                                        className="w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark p-3 text-sm focus:ring-2 focus:ring-primary/20 min-h-[80px] outline-none transition-all"
                                        placeholder="Brief summary for Google..."
                                        {...seoForm.getInputProps('seo_description')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Author */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Author Profile</h3>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-background-dark/50">
                                <ImageUpload 
                                    value={seoForm.values.author_image} 
                                    onChange={(file) => {
                                        if (file) {
                                            cmsService.uploadMedia(file).then(res => {
                                                seoForm.setFieldValue('author_image', res.url);
                                            });
                                        }
                                    }} 
                                    aspect={1}
                                    className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                                />
                                <div className="flex-1">
                                    <input 
                                        className="w-full bg-transparent border-none text-sm font-semibold text-text-primary dark:text-white focus:outline-none placeholder:text-text-tertiary"
                                        placeholder="Author name"
                                        {...seoForm.getInputProps('author_name')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area - Full Width/Height */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark">
                    <div className="h-full flex flex-col">
                        
                        {/* Content Area - Fixed Header/Editor */}
                        <div className="flex-1 p-6 md:p-12 min-h-0 bg-gray-50 dark:bg-background-dark">
                            <div className="max-w-5xl mx-auto h-full flex flex-col">
                                <div className="mb-10">
                                    <input 
                                        className="w-full bg-transparent border-none text-5xl font-black text-text-primary dark:text-white focus:outline-none placeholder:text-text-tertiary tracking-tight"
                                        placeholder="Post Title"
                                        value={page.title}
                                        onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                    <input 
                                        className="w-full bg-transparent border-none text-2xl text-text-secondary dark:text-gray-400 mt-4 focus:outline-none placeholder:text-text-tertiary font-medium"
                                        placeholder="Add a subtitle..."
                                        value={seoForm.values.subtitle}
                                        onChange={(e) => seoForm.setFieldValue('subtitle', e.target.value)}
                                    />
                                    <div className="h-px w-24 bg-primary/20 mt-8 mb-2"></div>
                                </div>
                                <div className="flex-1">
                                    <QuillEditor 
                                        content={page.draft_content} 
                                        onChange={(newContent) => setPage(prev => ({ ...prev, draft_content: newContent }))} 
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
