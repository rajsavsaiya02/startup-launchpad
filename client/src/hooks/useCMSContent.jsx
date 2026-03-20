import { useState, useEffect } from 'react';
import { cmsService } from '../services/cmsService';
import { Helmet } from 'react-helmet-async';

export function useCMSContent(slug) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchContent = async () => {
            try {
                setLoading(true);
                // Check for preview param in URL if not passed explicitly, or pass via arguments
                const searchParams = new URLSearchParams(window.location.search);
                const isPreview = searchParams.get('preview') === 'true';
                const previewId = searchParams.get('id');

                let result;
                if (isPreview && previewId) {
                    // Fetch draft content
                    result = await cmsService.getPageAdmin(previewId);
                    // Map draft_content to published_content structure if needed for consistent checking
                    // But typically getPageAdmin returns full object. return structure is: { draft_content, ... }
                } else {
                    result = await cmsService.getPagePublic(slug);
                }
                
                if (isMounted) setData(result);
            } catch (err) {
                if (isMounted) setError(err);
                // Don't log 404s deeply, just handle
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (slug) {
            fetchContent();
        }

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const SEO = () => {
        if (!data) return null;
        const { seo_title, seo_description, seo_keywords, og_image_url } = data;
        
        return (
            <Helmet>
                {seo_title && <title>{seo_title}</title>}
                {seo_description && <meta name="description" content={seo_description} />}
                {seo_keywords && <meta name="keywords" content={seo_keywords} />}
                {og_image_url && <meta property="og:image" content={og_image_url} />}
                {seo_title && <meta property="og:title" content={seo_title} />}
                {seo_description && <meta property="og:description" content={seo_description} />}
            </Helmet>
        );
    };

    return { 
        content: data?.published_content || data?.draft_content || {}, 
        raw: data,
        pageData: data,
        loading, 
        error,
        SEO 
    };
}
