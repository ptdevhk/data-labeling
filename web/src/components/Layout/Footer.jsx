import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-semi-color-bg-1 border-t border-semi-color-border'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-6'>
          {/* Resources Section */}
          <div>
            <h3 className='text-sm font-semibold text-semi-color-text-0 mb-3'>
              {t('footer.resources')}
            </h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='/exports'
                  className='text-sm text-semi-color-text-2 hover:text-semi-color-primary transition-colors'
                >
                  {t('footer.exportFormats')}
                </a>
              </li>
              <li>
                <a
                  href='/settings'
                  className='text-sm text-semi-color-text-2 hover:text-semi-color-primary transition-colors'
                >
                  {t('footer.settings')}
                </a>
              </li>
              <li>
                <a
                  href='/docs'
                  className='text-sm text-semi-color-text-2 hover:text-semi-color-primary transition-colors'
                >
                  {t('footer.documentation')}
                </a>
              </li>
            </ul>
          </div>

          {/* Version Info */}
          <div>
            <h3 className='text-sm font-semibold text-semi-color-text-0 mb-3'>
              {t('footer.version')}
            </h3>
            <p className='text-sm text-semi-color-text-2'>
              v{__APP_VERSION__ || '1.0.0'}
            </p>
            <p className='text-xs text-semi-color-text-3 mt-2'>
              {t('footer.buildInfo')}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-semi-color-border pt-6'>
          <p className='text-sm text-semi-color-text-2 text-center'>
            © {currentYear} {t('common.appName')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
