import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66% 0px' }
    );

    headings.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="space-y-2">
      <p className="font-bold text-text-primary dark:text-white text-sm uppercase tracking-wider mb-4">
        In this article
      </p>
      <ul className="space-y-3 border-l border-border-light dark:border-border-dark pl-4">
        {headings.map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                "block text-sm transition-all duration-200 hover:text-primary",
                activeId === id 
                  ? "text-primary font-semibold translate-x-1" 
                  : "text-text-tertiary dark:text-gray-400"
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {id.replace(/-/g, ' ')}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}