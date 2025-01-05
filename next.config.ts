import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Exclude onnxruntime-node from webpack build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        crypto: false,
      };
    }
    config.externals = [...(config.externals || []), 'onnxruntime-node'];
    
    // Suppress warnings from @huggingface/transformers
    config.ignoreWarnings = [
      { module: /@huggingface\/transformers/ }
    ];
    
    return config;
  },
};

export default nextConfig;
