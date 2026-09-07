import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Check, 
  GripVertical,
  Star,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadPropertyImage } from '../../services/storageService';

interface ImageFile {
  id: string;
  url: string;
  file?: File;
  progress: number;
  status: 'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR';
  isMain: boolean;
}

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  propertyId?: string;
}

export default function ImageUpload({ images: initialImages = [], onChange, propertyId }: ImageUploadProps) {
  const [imageList, setImageList] = useState<ImageFile[]>(() =>
    initialImages.map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
      progress: 100,
      status: 'SUCCESS',
      isMain: index === 0
    }))
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Keep imageList in sync if parent updates initialImages (e.g. after async fetch)
  useEffect(() => {
    setImageList(prev => {
      const currentSuccessUrls = prev.filter(img => img.status === 'SUCCESS').map(img => img.url);
      const isSame = 
        currentSuccessUrls.length === initialImages.length &&
        currentSuccessUrls.every((url, i) => url === initialImages[i]);
      if (isSame) return prev;

      const pending = prev.filter(img => img.status === 'UPLOADING' || img.status === 'IDLE');
      const loaded: ImageFile[] = initialImages.map((url, index) => ({
        id: `existing-${index}-${url}`,
        url,
        progress: 100,
        status: 'SUCCESS',
        isMain: index === 0
      }));
      return [...loaded, ...pending];
    });
  }, [initialImages]);

  const updateImageStatus = useCallback((id: string, status: ImageFile['status'], progress = 0, url?: string) => {
    setImageList(prev => {
      const newList = prev.map(img => 
        img.id === id ? { ...img, status, progress, url: url || img.url } : img
      );

      // Notify parent safely outside of the setState render cycle
      if (status === 'SUCCESS') {
        const successUrls = newList
          .filter(img => img.status === 'SUCCESS')
          .map(img => img.url);
        setTimeout(() => {
          onChangeRef.current(successUrls);
        }, 0);
      }

      return newList;
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      url: URL.createObjectURL(file),
      file,
      progress: 0,
      status: 'IDLE',
      isMain: imageList.length === 0 && index === 0
    }));

    setImageList(prev => [...prev, ...newImages]);

    // Auto-upload
    for (const image of newImages) {
      if (image.file) {
        try {
          updateImageStatus(image.id, 'UPLOADING', 10);
          const downloadUrl = await uploadPropertyImage(image.file, propertyId || 'temp');
          updateImageStatus(image.id, 'SUCCESS', 100, downloadUrl);
        } catch (error) {
          console.error('Upload error:', error);
          updateImageStatus(image.id, 'ERROR');
        }
      }
    }
  }, [imageList.length, propertyId, updateImageStatus]);

  const removeImage = (id: string) => {
    setImageList(prev => {
      const newList = prev.filter(img => img.id !== id);
      if (newList.length > 0 && !newList.some(img => img.isMain)) {
        newList[0].isMain = true;
      }
      const successUrls = newList.filter(img => img.status === 'SUCCESS').map(img => img.url);
      setTimeout(() => {
        onChangeRef.current(successUrls);
      }, 0);
      return newList;
    });
  };

  const setMainImage = (id: string) => {
    setImageList(prev => {
      const newList = prev.map(img => ({ ...img, isMain: img.id === id }));
      const mainIndex = newList.findIndex(img => img.isMain);
      if (mainIndex > -1) {
        const [main] = newList.splice(mainIndex, 1);
        newList.unshift(main);
      }
      const successUrls = newList.filter(img => img.status === 'SUCCESS').map(img => img.url);
      setTimeout(() => {
        onChangeRef.current(successUrls);
      }, 0);
      return newList;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
  });

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer
          ${isDragActive ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent hover:bg-slate-50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload className="text-slate-400" />
        </div>
        <h4 className="text-lg font-black text-primary tracking-tight">Arraste fotos ou clique para selecionar</h4>
        <p className="text-slate-400 text-sm font-medium mt-1">Formatos suportados: JPG, PNG, WEBP (Máx. 5MB por foto)</p>
      </div>

      {imageList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {imageList.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`
                  relative aspect-square rounded-2xl overflow-hidden group border-2
                  ${img.isMain ? 'border-accent shadow-lg shadow-accent/20' : 'border-slate-100'}
                `}
              >
                <img src={img.url} alt="Imóvel" className="w-full h-full object-cover" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {!img.isMain && img.status === 'SUCCESS' && (
                    <button 
                      type="button"
                      onClick={() => setMainImage(img.id)}
                      className="p-2 bg-white text-primary rounded-lg hover:bg-accent hover:text-white transition-all shadow-xl"
                      title="Definir como principal"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    title="Remover"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Main Badge */}
                {img.isMain && (
                  <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg">
                    Principal
                  </div>
                )}

                {/* Upload Status */}
                {img.status === 'UPLOADING' && (
                  <div className="absolute inset-0 bg-primary/60 flex flex-col items-center justify-center p-4">
                    <Loader2 className="text-white animate-spin mb-2" size={24} />
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${img.progress}%` }} />
                    </div>
                  </div>
                )}

                {img.status === 'ERROR' && (
                  <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center p-4 text-center">
                    <X className="text-white mb-1" size={24} />
                    <span className="text-[8px] text-white font-black uppercase tracking-widest">Erro no upload</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
