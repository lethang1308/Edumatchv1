import { useEffect, useState } from 'react';
import { masterDataService } from '@/services/masterDataService';
import { administrativeProvinces as fallbackProvinces, getAdministrativeWards } from '@/data/administrativeUnits';

const options = (items) =>
  items.map((item) => ({ ...item, id: String(item.id), label: item.name }));

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase()
  .trim();

export function useAdministrativeOptions(provinceName) {
  const [provinces, setProvinces] = useState([]);
  const [children, setChildren] = useState({ parentId: null, items: [] });
  const [error, setError] = useState('');
  const province = provinces.find((item) => normalize(item.name) === normalize(provinceName));
  useEffect(() => {
    let active = true;
    masterDataService
      .provinces()
      .then((items) => {
        if (active) setProvinces(items.length ? options(items) : fallbackProvinces);
      })
      .catch(() => {
        if (active) {
          setProvinces(fallbackProvinces);
          setError('');
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!province?.id) return undefined;
    let active = true;
    const fallbackProvince = fallbackProvinces.find(
      (item) => normalize(item.name) === normalize(province.name),
    );
    const fallbackWards = getAdministrativeWards(fallbackProvince?.name || province.name);
    masterDataService
      .wards(province.id)
      .then((items) => {
        if (active) {
          setChildren({ parentId: province.id, items: items.length ? options(items) : fallbackWards });
          setError('');
        }
      })
      .catch(() => {
        if (active) {
          setChildren({ parentId: province.id, items: fallbackWards });
          setError(fallbackWards.length ? '' : 'Chưa tải được danh mục phường/xã.');
        }
      });
    return () => {
      active = false;
    };
  }, [province?.id, province?.name]);
  return {
    administrativeProvinces: provinces,
    wardOptions: children.parentId === province?.id ? children.items : [],
    error,
  };
}
