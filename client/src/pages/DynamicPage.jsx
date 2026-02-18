import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCMSContent } from '../hooks/useCMSContent';
import { QuillEditor } from '../features/admin/content/QuillEditor';
// Actually TiptapEditor is an editor. We need a renderer or read-only mode.
// Tiptap can be read-only using `editable: false`.
// Let's create a simple wrapper or use TiptapEditor with readOnly prop.

function PageRenderer({ content }) {
    return (
        <div className="prose dark:prose-invert max-w-none">
             <QuillEditor content={content} readOnly={true} onChange={() => {}} />
        </div>
    );
}

export function DynamicPage() {
    const { slug } = useParams();
    const { content, loading, error, SEO } = useCMSContent(slug);

    if (loading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 w-48 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (error || !content) {
        return <div className="min-h-screen pt-32 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p>Page not found</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark pt-20 pb-20">
            <SEO />
            {/* Hero Section if defined in content, otherwise standard container */}
            <div className="container mx-auto px-4 max-w-4xl">
                 <PageRenderer content={typeof content === 'string' ? content : ''} />
            </div>
        </div>
    );
}
