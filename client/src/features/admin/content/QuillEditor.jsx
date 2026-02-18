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
    <div className="quill-wrapper bg-white dark:bg-background-dark rounded-md overflow-hidden border border-border-light dark:border-border-dark">
      <style>{`
        .ql-container {
            font-family: inherit;
            min-height: 400px;
            font-size: 1.125rem;
        }
        .ql-editor {
            min-height: 400px;
            padding: 1.5rem;
        }
        .ql-toolbar {
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-light) !important;
            background-color: var(--surface-light);
        }
        .dark .ql-toolbar {
             border-color: var(--border-dark) !important;
             background-color: var(--surface-dark);
             filter: invert(1) hue-rotate(180deg);
        }
        /* Fix icon invert affecting colors badly, instead manually style if possible or use simpler dark mode fix */
        .dark .ql-picker { color: black; }
        .dark .ql-stroke { stroke: black; }
        .dark .ql-fill { fill: black; }
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
