// Serves the production build (`astro build` output) for the browser tests.
// The home page is fully static, so a plain file server is enough, and it
// shows the site the way visitors get it: real image sizes, no dev server
// generating images on request. The apply form's API route isn't here;
// tests that submit the form intercept the request instead.
import {createReadStream, existsSync, statSync} from "node:fs";
import {createServer} from "node:http";
import {extname, join, normalize, resolve} from "node:path";

const ROOT = resolve(process.env.STATIC_ROOT ?? ".vercel/output/static");
const PORT = Number(process.env.PORT ?? 4322);

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".woff2": "font/woff2",
    ".xml": "application/xml",
    ".txt": "text/plain",
};

if (!existsSync(join(ROOT, "index.html"))) {
    console.error(`No build found in ${ROOT}. Run \`npm run build\` first.`);
    process.exit(1);
}

createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    // normalize() collapses "../" so a request can't climb out of the build folder.
    let file = join(ROOT, normalize(path));
    if (!file.startsWith(ROOT)) {
        response.writeHead(403).end();
        return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) {
        response.writeHead(404, {"content-type": TYPES[".html"]});
        createReadStream(join(ROOT, "404.html")).pipe(response);
        return;
    }
    response.writeHead(200, {"content-type": TYPES[extname(file)] ?? "application/octet-stream"});
    createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`Serving ${ROOT} on http://localhost:${PORT}`));
