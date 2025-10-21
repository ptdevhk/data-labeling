import { useMemo } from 'react';

/**
 * Hook to manage header navigation links configuration
 * Simplified version based on new-api pattern
 * 
 * @param {Function} t - Translation function from react-i18next
 * @returns {Object} - Object containing mainNavLinks array
 */
export const useNavigation = (t) => {
  const mainNavLinks = useMemo(() => {
    const allLinks = [
      {
        text: t('nav.home'),
        itemKey: 'home',
        to: '/',
      },
      {
        text: t('nav.console'),
        itemKey: 'console',
        to: '/console',
      },
      {
        text: t('nav.projects'),
        itemKey: 'projects',
        to: '/console/projects',
      },
    ];

    // For future extensibility: filter based on configuration
    // const modules = { home: true, console: true, projects: true };
    // return allLinks.filter((link) => modules[link.itemKey] === true);

    return allLinks;
  }, [t]);

  return {
    mainNavLinks,
  };
};
