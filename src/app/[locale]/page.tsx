import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <div className="home-container">
      <section className="hero">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
        <div className="actions">
          <button className="btn primary">{t('login')}</button>
          <button className="btn secondary">{t('register')}</button>
        </div>
      </section>
      
      <section className="features">
        <div className="card">
          <h2>{t('simulator')}</h2>
        </div>
        <div className="card">
          <h2>{t('ranking')}</h2>
        </div>
      </section>
    </div>
  );
}
