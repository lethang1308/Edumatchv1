import { useEffect, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { getProviderVerification } from '@/services/providerVerificationService';
import './verifiedBadge.css';

export function VerifiedBadge({ userId, className = '' }) {
  const [record, setRecord] = useState(null);
  useEffect(() => {
    let active = true;
    let version = 0;
    const load = async () => {
      const current = ++version;
      try {
        const result = await getProviderVerification(userId);
        if (active && current === version) setRecord(result);
      } catch {
        if (active && current === version) setRecord(null);
      }
    };
    load();
    window.addEventListener('focus', load);
    window.addEventListener('edumatch:verification-updated', load);
    return () => {
      active = false;
      window.removeEventListener('focus', load);
      window.removeEventListener('edumatch:verification-updated', load);
    };
  }, [userId]);
  if (
    String(record?.user_id) !== String(userId) ||
    record?.verification_status !== 'verified' ||
    !record?.verified_at
  )
    return null;
  return (
    <span className={`verified-provider-badge ${className}`}>
      <BadgeCheck size={15} aria-hidden="true" />
      {record.role === 'center' ? 'Đã xác thực pháp lý' : 'Đã xác minh chuyên môn'}
    </span>
  );
}
