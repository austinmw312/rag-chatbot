import type { NextConfig } from "next";
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    // Exclude onnxruntime-node from webpack build
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        crypto: false,
      };
    }
    config.externals = (config.externals || []) as string[];
    (config.externals as string[]).push('onnxruntime-node');
    
    // Suppress warnings from @huggingface/transformers
    config.ignoreWarnings = [
      { module: /@huggingface\/transformers/ }
    ];
    
    return config;
  },
};

export default nextConfig;
