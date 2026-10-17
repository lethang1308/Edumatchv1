import { ImagePlus, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const MAX_MEDIA_SIZE = 10 * 1024 * 1024;

export function MediaAttachment({ value, onChange, id, label = 'Ảnh / video' }) {
  const inputRef = useRef(null);

  const chooseMedia = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn tệp ảnh hoặc video.');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      toast.error('Tệp đính kèm tối đa 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ src: String(reader.result), name: file.name, type: file.type.startsWith('video/') ? 'video' : 'image' });
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return <span className="image-attachment">
    <input ref={inputRef} id={id} type="file" accept="image/*,video/*" onChange={chooseMedia} />
    <label htmlFor={id} title="Đính kèm ảnh hoặc video">{value?.type === 'video' ? <Video size={16} /> : <ImagePlus size={16} />}<span>{label}</span></label>
    {value && <span className="image-attachment__preview">{value.type === 'video' ? <video src={value.src} muted /> : <img src={value.src} alt="Ảnh đính kèm xem trước" />}<button type="button" onClick={clearImage} aria-label="Xóa tệp đính kèm"><X size={12} /></button></span>}
  </span>;
}

export const ImageAttachment = MediaAttachment;
export default MediaAttachment;
