import { createMDX } from "fumadocs-mdx/next"
import withRspack from "next-rspack"
import mod from "module";

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
  webpack(webpackConfig, { webpack, config, dir, isServer }) {
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
      if (!isServer) {
        console.log("\nUsing NextExternalsPlugin for external dependencies\n");
      }
      webpackConfig.externals = [];

      const compilerType = webpackConfig.name
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const builtinModules = mod.builtinModules
      const optOutBundlingPackageRegex = /[/\\]node_modules[/\\](@appsignal[/\\]nodejs|@aws-sdk[/\\]client-s3|@aws-sdk[/\\]s3-presigned-post|@blockfrost[/\\]blockfrost-js|@highlight-run[/\\]node|@huggingface[/\\]transformers|@jpg-store[/\\]lucid-cardano|@libsql[/\\]client|@mikro-orm[/\\]core|@mikro-orm[/\\]knex|@node-rs[/\\]argon2|@node-rs[/\\]bcrypt|@prisma[/\\]client|@react-pdf[/\\]renderer|@sentry[/\\]profiling-node|@sparticuz[/\\]chromium|@sparticuz[/\\]chromium-min|@swc[/\\]core|@xenova[/\\]transformers|argon2|autoprefixer|aws-crt|bcrypt|better-sqlite3|canvas|chromadb-default-embed|config|cpu-features|cypress|dd-trace|eslint|express|firebase-admin|htmlrewriter|import-in-the-middle|isolated-vm|jest|jsdom|keyv|libsql|mdx-bundler|mongodb|mongoose|newrelic|next-mdx-remote|next-seo|node-cron|node-pty|node-web-audio-api|onnxruntime-node|oslo|pg|playwright|playwright-core|postcss|prettier|prisma|puppeteer|puppeteer-core|ravendb|require-in-the-middle|rimraf|sharp|shiki|sqlite3|ts-node|ts-morph|typescript|vscode-oniguruma|webpack|websocket|zeromq)[/\\]/
      const finalTranspilePackages = [
        'geist',
        ...config.transpilePackages ?? [],
      ]
      for (const pkg of config.experimental.optimizePackageImports || []) {
        if (!finalTranspilePackages.includes(pkg)) {
          finalTranspilePackages.push(pkg)
        }
      }
      webpackConfig.plugins.push(
        new webpack.NextExternalsPlugin({
          compilerType,
          config,
          builtinModules,
          optOutBundlingPackageRegex,
          finalTranspilePackages,
          dir,
          defaultOverrides: {}
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
