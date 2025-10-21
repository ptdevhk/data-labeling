import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-semi-color-bg-1 border-t border-semi-color-border'>
      <div className='max-w-7xl mx-auto px-6 py-4'>
        <p className='text-sm text-semi-color-text-2'>
          © {currentYear} {t('common.appName')}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
