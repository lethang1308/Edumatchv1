import { ImagePlus, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const MAX_MEDIA_SIZE = 10 * 1024 * 1024;

export function MediaAttachment({ value, onChange, id, label = 'Ảnh / video', multiple = false, maxFiles = 12 }) {
  const inputRef = useRef(null);

  const chooseMedia = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const validFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (validFiles.length !== files.length) toast.error('Chỉ có thể chọn tệp ảnh hoặc video.');
    if (validFiles.some((file) => file.size > MAX_MEDIA_SIZE)) {
      toast.error('Mỗi tệp đính kèm tối đa 10 MB.');
      return;
    }

    const readFile = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ src: String(reader.result), name: file.name, type: file.type.startsWith('video/') ? 'video' : 'image' });
      reader.readAsDataURL(file);
    });

    Promise.all(validFiles.map(readFile)).then((nextItems) => {
      if (!multiple) {
        onChange(nextItems[0] || null);
        return;
      }
      const currentItems = Array.isArray(value) ? value : [];
      const merged = [...currentItems, ...nextItems].slice(0, maxFiles);
      if (merged.length < currentItems.length + nextItems.length) toast.error(`Mỗi album tối đa ${maxFiles} tệp.`);
      onChange(merged);
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
