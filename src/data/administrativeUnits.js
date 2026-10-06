import provinces from './vietnam-provinces-2025.json';
import wards from './vietnam-wards-2025.json';

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase();

export const administrativeProvinces = provinces
  .map(({ code, name, type }) => ({ id: String(code), name, type, label: name }))
  .sort((first, second) => first.name.localeCompare(second.name, 'vi'));

const provinceByName = new Map(administrativeProvinces.map((province) => [province.name, province]));

export function getAdministrativeWards(provinceName) {
  const province = provinceByName.get(provinceName);
  if (!province) return [];

  return wards
    .filter((ward) => String(ward.province_id) === province.id)
    .map(({ code, name, type }) => ({ id: String(code), name, type, label: name }))
    .sort((first, second) => first.name.localeCompare(second.name, 'vi'));
}

export function searchAdministrativeOptions(options, query, limit = 9) {
  const keyword = normalize(query).trim();
  if (!keyword) return options.slice(0, limit);
  return options
    .filter((option) => normalize(`${option.name} ${option.type}`).includes(keyword))
    .slice(0, limit);
}
