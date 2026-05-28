import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @ts-ignore
  allowedDevOrigins: ['192.168.0.6']
};

export default withNextIntl(nextConfig);
