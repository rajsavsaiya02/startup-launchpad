import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, File, ExternalLink, Box } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import { format } from 'date-fns';

export function SitemapPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSitemap() {
      try {
        const data = await cmsService.getPublicIndex();
        // Filter out 'home' slug aliases as it's already in static routes
        setPages(data.filter(p => !['home', 'homepage', 'home-page'].includes(p.slug.toLowerCase())));
      } catch (err) {
        console.error('Failed to load sitemap', err);
      } finally {
        setLoading(false);
      }
    }
    loadSitemap();
  }, []);

  // Static routes that aren't in CMS
  const staticRoutes = [
    { title: 'Home', path: '/', type: 'system' },
    { title: 'Features', path: '/features', type: 'system' },
    { title: 'Pricing', path: '/pricing', type: 'system' },
    { title: 'Contact Us', path: '/contact', type: 'system' },
    { title: 'About Us', path: '/about', type: 'system' },
    { title: 'Login', path: '/auth/login', type: 'auth' },
    { title: 'Help Center', path: '/help-center', type: 'system' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Sitemap</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                An index of all pages available on Startup Launchpad.
            </p>
        </div>

        {loading ? (
             <div className="space-y-4 animate-pulse">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                ))}
            </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-12">
                
                {/* System Pages */}
                <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-2 dark:border-gray-800">
                        <Box className="w-5 h-5 mr-2 text-blue-600" />
                        Main Pages
                    </h2>
                    <ul className="space-y-3">
                        {staticRoutes.map((route, i) => (
                            <li key={i}>
                                <Link to={route.path} className="flex items-center group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                        <Home className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {route.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CMS Pages */}
                <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center border-b pb-2 dark:border-gray-800">
                        <File className="w-5 h-5 mr-2 text-purple-600" />
                        Content Pages
                    </h2>
                    {pages.length === 0 ? (
                        <p className="text-gray-500 italic">No additional content pages found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {pages.map((page) => (
                                <li key={page.slug}>
                                    <Link to={`/${page.slug}`} className="flex items-center justify-between group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                                {page.title}
                                            </span>
                                        </div>
                                        {page.updated_at && (
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(page.updated_at), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        )}
      </div>
    </div>
  );
}
