// Injected by webpack DefinePlugin: true for dev/`watch`/test builds, false for the production RELEASE
// build (`npm run build:prod`, which passes `--env release`). Gate every dev-only feature on this flag
// (version/debug tag, cheats, debug logging); terser then dead-code-eliminates them from the release bundle.
declare const __DEV_BUILD__: boolean;

// Build version string (e.g. "v1.0.7"), injected by DefinePlugin from the root version.json that the
// `prebuild` hook (scripts/bump-version.cjs) auto-increments each build. Exposed as VERSION in Config.ts.
declare const __VERSION__: string;

// images
declare module '*.apng' {
    const src: string
    export default src
}
declare module '*.png' {
    const src: string
    export default src
}
declare module '*.jpg' {
    const src: string
    export default src
}
declare module '*.jpeg' {
    const src: string
    export default src
}
declare module '*.jfif' {
    const src: string
    export default src
}
declare module '*.pjpeg' {
    const src: string
    export default src
}
declare module '*.pjp' {
    const src: string
    export default src
}
declare module '*.gif' {
    const src: string
    export default src
}
declare module '*.svg' {
    const src: string
    export default src
}
declare module '*.ico' {
    const src: string
    export default src
}
declare module '*.webp' {
    const src: string
    export default src
}
declare module '*.avif' {
    const src: string
    export default src
}

// Shaders
declare module '*.frag' {
    const src: string
    export default src
}
declare module '*.vert' {
    const src: string
    export default src
}
declare module '*.glsl' {
    const src: string
    export default src
}
declare module '*.vs' {
    const src: string
    export default src
}
declare module '*.fs' {
    const src: string
    export default src
}
