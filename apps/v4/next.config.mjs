import { createMDX } from "fumadocs-mdx/next"
import withRspack from "next-rspack"

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  redirects() {
    return [
      {
        source: "/components",
        destination: "/docs/components",
        permanent: true,
      },
      {
        source: "/docs/primitives/:path*",
        destination: "/docs/components/:path*",
        permanent: true,
      },
      {
        source: "/figma",
        destination: "/docs/figma",
        permanent: true,
      },
      {
        source: "/docs/forms",
        destination: "/docs/components/form",
        permanent: false,
      },
      {
        source: "/docs/forms/react-hook-form",
        destination: "/docs/components/form",
        permanent: false,
      },
      {
        source: "/sidebar",
        destination: "/docs/components/sidebar",
        permanent: true,
      },
      {
        source: "/react-19",
        destination: "/docs/react-19",
        permanent: true,
      },
      {
        source: "/charts",
        destination: "/charts/area",
        permanent: true,
      },
      {
        source: "/view/styles/:style/:name",
        destination: "/view/:name",
        permanent: true,
      },
    ]
  },
  webpack(webpackConfig, { webpack, config, dir }) {
    if (process.env.RSPACK_TRACE) {
      if (!globalThis.registerGlobalTrace) {
        webpack.experiments.globalTrace.register(
          "OVERVIEW",
          "perfetto",
          path.join(__dirname, "rspack.pftrace")
        );
        globalThis.registerGlobalTrace = true
      }
    }

    if ("NextExternalsPlugin" in webpack) {
      delete webpackConfig.externals

      const compilerType = webpackConfig.name
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const builtinModules = require('module').builtinModules
      webpackConfig.plugins.push(
        new webpack.NextExternalsPlugin({
          compilerType,
          config,
          builtinModules,
          optOutBundlingPackageRegex,
          finalTranspilePackages,
          dir,
          defaultOverrides
        })
      )
    }

    webpackConfig.plugins.push({
      apply(compiler) {
        compiler.hooks.compilation.tap("PLUGIN", () => {
          console.time(compiler.name);
        })
        compiler.hooks.done.tap("PLUGIN", () => {
          console.timeEnd(compiler.name);
        })
      }
    })

    webpackConfig.cache = false;
    // config.experiments.cache = {
    //   type: 'persistent',
    // };
    return webpackConfig;
  }
}

const withMDX = createMDX({})

export default process.env.NEXT_RSPACK ? withRspack(withMDX(nextConfig)) : withMDX(nextConfig)
