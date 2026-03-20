import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cmsService } from '../../../services/cmsService';
import { Button } from '../../../components/ui/Button';
import { Image as ImageIcon } from 'lucide-react';

export function QuillEditor({ content, onChange, readOnly = false }) {
  const quillRef = useRef(null);

  // Custom Image Handler
  const imageHandler = React.useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const res = await cmsService.uploadMedia(file);
          const url = res.url;
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', url);
        } catch (error) {
          console.error('Image upload failed', error);
          alert('Image upload failed');
        }
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list',
    'link', 'image'
  ];

  if (readOnly) {
      return (
          <div className="prose dark:prose-invert max-w-none ql-editor-read-only"
               dangerouslySetInnerHTML={{ __html: content }}
          />
      );
  }

  return (
    <div className="quill-wrapper bg-transparent">
      <style>{`
        .quill-wrapper .ql-toolbar.ql-snow {
            border: none !important;
            border-bottom: 1px solid var(--border-light) !important;
            background-color: transparent !important;
            padding: 1rem 0;
            margin-bottom: 1.5rem;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .dark .quill-wrapper .ql-toolbar.ql-snow {
            border-bottom-color: var(--border-dark) !important;
        }

        .quill-wrapper .ql-container.ql-snow {
            border: none !important;
            font-family: inherit;
            font-size: 1.25rem;
            line-height: 1.8;
            color: var(--text-primary);
        }

        .dark .quill-wrapper .ql-container.ql-snow {
            color: #e5e7eb;
        }

        .quill-wrapper .ql-editor {
            min-height: 500px;
            padding: 0 !important;
        }

        .quill-wrapper .ql-editor.ql-blank::before {
            left: 0 !important;
            font-style: normal;
            opacity: 0.3;
            color: var(--text-tertiary);
        }

        /* Better Dark Mode Icons */
        .dark .ql-snow .ql-stroke {
            stroke: #9ca3af !important;
        }
        .dark .ql-snow .ql-fill {
            fill: #9ca3af !important;
        }
        .dark .ql-snow .ql-picker {
            color: #9ca3af !important;
        }
        .dark .ql-snow .ql-picker-options {
            background-color: var(--surface-dark) !important;
            border-color: var(--border-dark) !important;
        }
        
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke {
            stroke: var(--primary) !important;
        }
        
        .ql-snow.ql-toolbar button:hover .ql-fill,
        .ql-snow.ql-toolbar button.ql-active .ql-fill {
            fill: var(--primary) !important;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write something amazing..."
      />
    </div>
  );
}
