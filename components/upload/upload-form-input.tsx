'use client';
import { Button } from '@/components/ui/button';

interface UploadFormInputProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function UploadFormInput({ onSubmit }: UploadFormInputProps) {
    return (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <input type="file" />
            <Button>Upload your PDF</Button>
        </form>
    );
}