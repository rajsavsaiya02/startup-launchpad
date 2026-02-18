import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form'; 
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, Globe, History, ArrowLeft, Eye, RotateCcw, Upload } from 'lucide-react';
import { cmsService } from '../../../services/cmsService';
import { useToast } from '../../../components/ui/Toast';
import { QuillEditor } from './QuillEditor';
import { ImageUpload } from '../../../components/ui/ImageUpload';

export function CMSEditorPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content'); // content, seo, history
    const [saving, setSaving] = useState(false);

    // Form for SEO metadata
    const seoForm = useForm({
        initialValues: {
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            og_image_url: ''
        }
    });

    useEffect(() => {
        loadPage();
    }, [slug]);

    const loadPage = async () => {
        try {
            setLoading(true);
            const pages = await cmsService.getPages();
            const found = pages.find(p => p.slug === slug);
            
            if (found) {
                 const fullPage = await cmsService.getPageAdmin(found.id);
                 setPage(fullPage);
                 seoForm.setValues({
                     seo_title: fullPage.seo_title || '',
                     seo_description: fullPage.seo_description || '',
                     seo_keywords: fullPage.seo_keywords || '',
                     og_image_url: fullPage.og_image_url || ''
                 });
            } else {
                addToast('Page not found', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('Error loading page', 'error');
        } finally {
            setLoading(false);
        }
    };

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
                {/* Sidebar */}
                <div className="w-64 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 space-y-2">
                    <button 
                         onClick={() => setActiveTab('content')}
                         className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'content' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        Page Content
                    </button>
                    <button 
                         onClick={() => setActiveTab('seo')}
                         className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'seo' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        SEO & Metadata
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`w-full text-left px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'history' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        Version History
                    </button>
                </div>

                {/* Content Area - Full Width/Height */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark">
                    <div className="h-full flex flex-col">
                        
                        {activeTab === 'content' && (
                           <div className="flex-1 p-6 md:p-8 min-h-0">
                                <QuillEditor 
                                    content={page.draft_content} 
                                    onChange={(newContent) => setPage(prev => ({ ...prev, draft_content: newContent }))} 
                                />
                           </div>
                        )}

                        {activeTab === 'seo' && (
                            <div className="max-w-3xl mx-auto p-8 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm m-8">
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold mb-4">Search Engine Optimization</h2>
                                    <Input 
                                        label="SEO Title" 
                                        description="Title tag for search engines (50-60 chars)"
                                        {...seoForm.getInputProps('seo_title')}
                                    />
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-text-secondary">Meta Description</label>
                                        <textarea 
                                            className="w-full rounded-md border border-gray-300 dark:border-border-dark bg-white dark:bg-background-dark p-2 text-sm"
                                            rows={3}
                                            {...seoForm.getInputProps('seo_description')}
                                        />
                                        <p className="text-xs text-text-tertiary">Summary for search results (150-160 chars)</p>
                                    </div>
                                    <Input 
                                        label="Keywords" 
                                        description="Comma separated keywords"
                                        {...seoForm.getInputProps('seo_keywords')}
                                    />
                                    
                                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                                        <h3 className="text-md font-medium mb-3">Social Share Image (OG Image)</h3>
                                        <ImageUpload 
                                            value={seoForm.values.og_image_url} 
                                            onChange={(file) => {
                                                if (file) {
                                                    cmsService.uploadMedia(file).then(res => {
                                                        seoForm.setFieldValue('og_image_url', res.url);
                                                    });
                                                }
                                            }} 
                                            aspect={1.91}
                                            className="w-full max-w-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="text-center text-text-tertiary py-12">
                                <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Version history management coming soon.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
