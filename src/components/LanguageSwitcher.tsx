'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {ChangeEvent} from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    router.replace(pathname, {locale: nextLocale});
  }

  return (
    <select 
      className="lang-switcher" 
      defaultValue={locale} 
      onChange={onSelectChange}
    >
      <option value="pt">PT</option>
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}
