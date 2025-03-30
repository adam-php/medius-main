import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Configure SVGR for SVG imports with specific options to support react-crypto-icons
    config.module.rules.push({
      test: /\.svg$/,
      oneOf: [
        // Handle react-crypto-icons specific imports
        {
          resourceQuery: /\?\+svgo,\+titleProp,\+ref/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgo: true,
                titleProp: true,
                ref: true
              }
            }
          ]
        },
        // Handle regular SVG imports
        {
          use: ['@svgr/webpack']
        }
      ]
    });

    return config;
  }
};

export default nextConfig;
