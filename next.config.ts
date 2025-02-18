import type { NextConfig } from 'next'

const config: NextConfig = {
  webpack: (config) => {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module?.rules?.find((rule: { test: { test: (arg0: string) => unknown } }) =>
      rule.test?.test?.('.svg')
    )

    if (!fileLoaderRule) {
      throw new Error('File loader rule for SVG not found')
    }

    config.module?.rules?.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      }
    )

    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
}

export default config