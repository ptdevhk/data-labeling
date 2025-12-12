import { useMemo } from 'react';

export const useNavigation = (t, docsLink, headerNavModules) => {
  const mainNavLinks = useMemo(() => {
    // Default configuration: show all modules if no config provided
    const defaultModules = {
      home: true,
      console: true,
      pricing: true,
      docs: true,
      about: true,
    };

    // Use provided configuration or default configuration
    const modules = headerNavModules || defaultModules;

    const allLinks = [
      {
        text: t('home'),
        itemKey: 'home',
        to: '/',
      },
      {
        text: t('console'),
        itemKey: 'console',
        to: '/console',
      },
      {
        text: t('pricing'),
        itemKey: 'pricing',
        to: '/pricing',
      },
      ...(docsLink
        ? [
            {
              text: t('docs'),
              itemKey: 'docs',
              isExternal: true,
              externalLink: docsLink,
            },
          ]
        : []),
      {
        text: t('about'),
        itemKey: 'about',
        to: '/about',
      },
    ];

    // Filter navigation links based on configuration
    return allLinks.filter((link) => {
      if (link.itemKey === 'docs') {
        return docsLink && modules.docs;
      }
      if (link.itemKey === 'pricing') {
        // Support new pricing configuration format
        return typeof modules.pricing === 'object'
          ? modules.pricing.enabled
          : modules.pricing;
      }
      return modules[link.itemKey] === true;
    });
  }, [t, docsLink, headerNavModules]);

  return {
    mainNavLinks,
  };
};
