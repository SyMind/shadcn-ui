# Performance Comparison

I tested the performance with the following steps:

1. Execute `pnpm run dev` or `pnpm run build`
2. Wait for the server to be ready (indicated by the 'Ready' message)
3. Run curl on the root endpoint (/)

Each build was run 5 times, and the shortest time to reach "Compiled successfully" was recorded.

Test environment: Apple M1 Pro CPU

| Bundler    | Build (No Cache)     | Build (Cache)     | Dev (No Cache)     | Dev (Cache)     |
|------------|----------------------|-------------------|--------------------|-----------------|
| Rspack     | 15.0s                | 8.0s              | 6.4s               | 0.432s          |
| Webpack    | 27.0s                | 13.0s             | 11s                | 9.6s            |
| Turbopack  | 14.5s                | —                 | 5.4s               | —               |
