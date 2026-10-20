import { useEffect, useState } from 'react';
import { masterDataService } from '@/services/masterDataService';

const options = (items) =>
  items.map((item) => ({ ...item, id: String(item.id), label: item.name }));

export function useAdministrativeOptions(provinceName) {
  const [provinces, setProvinces] = useState([]);
  const [children, setChildren] = useState({ parentId: null, items: [] });
  const [error, setError] = useState('');
  const province = provinces.find((item) => item.name === provinceName);
  useEffect(() => {
    let active = true;
    masterDataService
      .provinces()
      .then((items) => {
        if (active) setProvinces(options(items));
      })
      .catch(() => {
        if (active) setError('Chưa tải được danh mục tỉnh/thành.');
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!province?.id) return;
    let active = true;
    masterDataService
      .wards(province.id)
      .then((items) => {
        if (active) {
          setChildren({ parentId: province.id, items: options(items) });
          setError('');
        }
      })
      .catch(() => {
        if (active) setError('Chưa tải được danh mục phường/xã.');
      });
    return () => {
      active = false;
    };
  }, [province?.id]);
  return {
    administrativeProvinces: provinces,
    wardOptions: children.parentId === province?.id ? children.items : [],
    error,
  };
}
