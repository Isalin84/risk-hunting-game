import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  bucket: string;
  currentUrl?: string;
  onUpload: (path: string, url: string) => void;
}

export function ImageUploader({ bucket, currentUrl, onUpload }: ImageUploaderProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setPreview(data.publicUrl);
      onUpload(fileName, data.publicUrl);
    }
    setUploading(false);
  }, [bucket, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-brand-gold-soft hover:border-brand-gold rounded-lg p-4 cursor-pointer transition-colors text-center"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-brand-dark/50">
          {uploading ? (
            <Upload size={32} className="animate-pulse" />
          ) : (
            <ImageIcon size={32} />
          )}
          <span className="font-body text-sm">{t('admin.dropImage')}</span>
        </div>
      )}
    </div>
  );
}
