import { ImagePlus, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export function MediaAttachment({ value, onChange, id, label = 'Ảnh / video', multiple = false }) {
  const inputRef = useRef(null);

  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không thể đọc tệp đã chọn.'));
    reader.readAsDataURL(file);
  });

  const optimiseImage = async (file) => {
    const source = await readAsDataUrl(file);
    const image = await new Promise((resolve, reject) => {
      const preview = new Image();
      preview.onload = () => resolve(preview);
      preview.onerror = reject;
      preview.src = source;
    });
    const maximumDimension = 1440;
    const scale = Math.min(1, maximumDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const chooseMedia = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const validFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (validFiles.length !== files.length) toast.error('Chỉ có thể chọn tệp ảnh hoặc video.');
    const readFile = async (file) => {
      const isImage = file.type.startsWith('image/');
      let src;
      try {
        // Large source images are accepted, then stored in an optimized form so
        // posting remains reliable in the browser's local storage.
        src = isImage ? await optimiseImage(file) : await readAsDataUrl(file);
      } catch {
        src = await readAsDataUrl(file);
      }
      return { src, name: file.name, type: isImage ? 'image' : 'video' };
    };

    Promise.all(validFiles.map(readFile)).then((nextItems) => {
      if (!multiple) {
        onChange(nextItems[0] || null);
        return;
      }
      const currentItems = Array.isArray(value) ? value : [];
      onChange([...currentItems, ...nextItems]);
    }).catch(() => toast.error('Không thể chuẩn bị ảnh để đăng. Vui lòng chọn lại ảnh khác.')).finally(() => {
      event.target.value = '';
    });
  };

  const clearImage = (index = null) => {
    if (multiple) {
      onChange((Array.isArray(value) ? value : []).filter((_, itemIndex) => itemIndex !== index));
    } else {
      onChange(null);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const previewItems = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  return <span className="image-attachment">
    <input ref={inputRef} id={id} type="file" accept="image/*,video/*" multiple={multiple} onChange={chooseMedia} />
    <label htmlFor={id} title="Đính kèm ảnh hoặc video">{previewItems.some((item) => item.type === 'video') ? <Video size={16} /> : <ImagePlus size={16} />}<span>{label}</span></label>
    {previewItems.map((item, index) => <span className="image-attachment__preview" key={`${item.name || item.src}-${index}`}>{item.type === 'video' ? <video src={item.src} muted /> : <img src={item.src} alt="Ảnh đính kèm xem trước" />}<button type="button" onClick={() => clearImage(index)} aria-label="Xóa tệp đính kèm"><X size={12} /></button></span>)}
  </span>;
}

export const ImageAttachment = MediaAttachment;
export default MediaAttachment;
