import { useRoutes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';

/**
 * Root Router Component
 * Combines public and private route definitions
 */
export const AppRoutes = () => {
  const routes = useRoutes([...publicRoutes, ...privateRoutes]);
  return routes;
};

export default AppRoutes;
