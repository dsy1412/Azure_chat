'use client';

import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { cn, convertImageToBase64, isImageFile } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string, images?: string[]) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), images.length > 0 ? images : undefined);
      setMessage('');
      setImages([]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const validImages = files.filter(isImageFile);
      const base64Images = await Promise.all(
        validImages.map(file => convertImageToBase64(file))
      );
      setImages(prev => [...prev, ...base64Images]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-white p-4">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {images.map((imageBase64, index) => (
            <div key={index} className="relative group">
              <img
                src={`data:image/jpeg;base64,${imageBase64}`}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(
            'p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors',
            (disabled || uploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ImageIcon className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors',
              (disabled || !message.trim()) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
      
      {uploading && (
        <div className="mt-2 text-sm text-gray-500">Uploading images...</div>
      )}
    </div>
  );
}
