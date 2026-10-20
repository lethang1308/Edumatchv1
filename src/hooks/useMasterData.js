import { useEffect, useState } from 'react';
import { masterDataService } from '@/services/masterDataService';

export function useMasterData() {
  const [data, setData] = useState({ subjects: [], levels: [], banners: [], error: '' });
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      masterDataService.subjects(),
      masterDataService.levels(),
      masterDataService.banners(),
    ]).then((results) => {
      if (!active) return;
      setData({
        subjects: results[0].value || [],
        levels: results[1].value || [],
        banners: results[2].value || [],
        error: results.some((result) => result.status === 'rejected')
          ? 'Chưa tải được đầy đủ danh mục. Vui lòng tải lại trang để thử lại.'
          : '',
      });
    });
    return () => {
      active = false;
    };
  }, []);
  return data;
}
