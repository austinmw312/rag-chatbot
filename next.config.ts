import type { NextConfig } from "next";
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        crypto: false,
        pg: false,
        'pg-native': false
      };
    }

    // Add onnxruntime to externals for both client and server
    config.externals = [
      ...(config.externals as string[]) || [],
      'onnxruntime-node',
      'onnxruntime-web',
      '@onnxruntime/nodejs-gpu',
      '@onnxruntime/webgl',
    ];
    
    // Suppress warnings from @huggingface/transformers
    config.ignoreWarnings = [
      { module: /@huggingface\/transformers/ }
    ];
    
    return config;
  },
  serverExternalPackages: ['onnxruntime-node']
};

export default nextConfig;
