import React from 'react';
import { useForm } from '@mantine/form';
import { Modal } from '@mantine/core';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function CreatePageModal({ isOpen, onClose, onSubmit }) {
    const form = useForm({
        initialValues: {
            title: '',
            slug: ''
        },
        validate: {
            title: (value) => value.length < 2 ? 'Title must be at least 2 characters' : null,
            slug: (value) => {
                if (!value) return 'Slug is required';
                if (!/^[a-z0-9-]+$/.test(value)) return 'Slug can only contain lowercase letters, numbers, and dashes';
                return null;
            }
        }
    });

    const handleSubmit = (values) => {
        onSubmit(values);
        form.reset();
        onClose();
    };

    return (
        <Modal 
            opened={isOpen} 
            onClose={onClose} 
            title="Create New Page"
            centered
            className="dark:text-white"
            styles={{ 
                header: { backgroundColor: 'transparent' }, 
                body: { padding: '20px' },
                content: { backgroundColor: 'var(--mantine-color-body)' } 
            }}
        >
            <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                <Input 
                    label="Page Title" 
                    placeholder="e.g. Refund Policy" 
                    {...form.getInputProps('title')}
                    onChange={(e) => {
                         form.setFieldValue('title', e.target.value);
                         // Auto-generate slug if slug is empty or user hasn't typed in it heavily
                         if (!form.isDirty('slug')) {
                             const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                             form.setFieldValue('slug', slug);
                         }
                    }}
                />
                
                <Input 
                    label="URL Slug" 
                    description="The URL path for this page (e.g. /refund-policy)"
                    placeholder="e.g. refund-policy" 
                    {...form.getInputProps('slug')}
                />
                
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Create Page</Button>
                </div>
            </form>
        </Modal>
    );
}
