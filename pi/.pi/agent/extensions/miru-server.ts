import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { mkdir, readFile, readdir, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, normalize, relative, resolve } from "node:path";
import type { AddressInfo } from "node:net";

let server: Server | undefined;
let serverUrl: string | undefined;
let miruDir: string | undefined;
let miruRealDir: string | undefined;

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		await stopServer(ctx);

		try {
			miruDir = await ensureMiruDir(ctx.cwd);
			miruRealDir = await realpath(miruDir);
			server = createServer((req, res) => {
				void handleRequest(req, res).catch(() => {
					if (!res.headersSent) {
						send(res, req.method, 500, "Internal server error");
						return;
					}
					res.end();
				});
			});

			await new Promise<void>((resolvePromise, rejectPromise) => {
				const activeServer = server;
				if (!activeServer) {
					rejectPromise(new Error("Server was not created"));
					return;
				}

				activeServer.once("error", rejectPromise);
				activeServer.listen(0, "0.0.0.0", () => {
					activeServer.off("error", rejectPromise);
					resolvePromise();
				});
			});

			const address = server.address() as AddressInfo | null;
			if (!address) throw new Error("Server did not expose a listening address");

			serverUrl = `http://0.0.0.0:${address.port}`;
			if (ctx.hasUI) {
				ctx.ui.setStatus("miru-server", `miru: ${serverUrl}`);
			}
		} catch (error) {
			await stopServer(ctx);
			if (ctx.hasUI) {
				ctx.ui.notify(
					`Failed to start .miru server: ${error instanceof Error ? error.message : String(error)}`,
					"error",
				);
			}
		}
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		await stopServer(ctx);
	});
}

async function ensureMiruDir(cwd: string): Promise<string> {
	const dir = resolve(cwd, ".miru");
	await mkdir(dir, { recursive: true });
	return dir;
}

async function stopServer(ctx?: ExtensionContext): Promise<void> {
	const activeServer = server;
	server = undefined;
	serverUrl = undefined;
	miruDir = undefined;
	miruRealDir = undefined;

	if (ctx?.hasUI) {
		ctx.ui.setStatus("miru-server", undefined);
	}

	if (!activeServer) return;

	await new Promise<void>((resolvePromise) => {
		activeServer.close(() => resolvePromise());
	});
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
	if (!miruDir || !miruRealDir) {
		send(res, req.method, 503, "Server is not ready");
		return;
	}

	const method = req.method ?? "GET";
	if (method !== "GET" && method !== "HEAD") {
		res.setHeader("Allow", "GET, HEAD");
		send(res, method, 405, "Method not allowed");
		return;
	}

	let url: URL;
	try {
		url = new URL(req.url ?? "/", "http://127.0.0.1");
	} catch {
		send(res, method, 400, "Bad request");
		return;
	}

	if (url.pathname === "/") {
		const html = await renderRootListing(miruDir);
		send(res, method, 200, html, "text/html; charset=utf-8");
		return;
	}

	let targetPath: string;
	try {
		targetPath = resolveSafeTarget(miruDir, url.pathname);
	} catch (error) {
		send(res, method, error instanceof URIError ? 400 : 403, error instanceof URIError ? "Bad request" : "Forbidden");
		return;
	}

	try {
		const targetStat = await stat(targetPath);
		if (!targetStat.isFile()) {
			send(res, method, 404, "Not found");
			return;
		}

		const realTargetPath = await realpath(targetPath);
		const realRelative = relative(miruRealDir, realTargetPath);
		if (realRelative.startsWith("..") || realRelative === ".." || isAbsolute(realRelative)) {
			send(res, method, 403, "Forbidden");
			return;
		}

		const content = await readFile(realTargetPath);
		send(res, method, 200, content, getContentType(realTargetPath));
	} catch (error) {
		const code = (error as NodeJS.ErrnoException | undefined)?.code;
		if (code === "ENOENT" || code === "ENOTDIR") {
			send(res, method, 404, "Not found");
			return;
		}
		send(res, method, 500, "Internal server error");
	}
}

function resolveSafeTarget(baseDir: string, requestPath: string): string {
	const decodedPath = decodeURIComponent(requestPath);
	const relativePath = normalize(decodedPath).replace(/^\/+/, "");
	const targetPath = resolve(baseDir, relativePath);
	const rel = relative(baseDir, targetPath);

	if (rel.startsWith("..") || rel === ".." || isAbsolute(rel)) {
		throw new Error("Path traversal attempt");
	}

	return targetPath;
}

async function renderRootListing(baseDir: string): Promise<string> {
	const entries = await readdir(baseDir, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.sort((a, b) => a.localeCompare(b));

	const items = files.length
		? files
				.map((name) => `<li><a href="/${encodeURIComponent(name)}">${escapeHtml(name)}</a></li>`)
				.join("\n")
		: "<li><em>No files in .miru yet</em></li>";

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>.miru</title>
</head>
<body>
  <h1>.miru</h1>
  <ul>
    ${items}
  </ul>
</body>
</html>`;
}

function getContentType(filePath: string): string {
	return extname(filePath).toLowerCase() === ".html"
		? "text/html; charset=utf-8"
		: "application/octet-stream";
}

function send(
	res: ServerResponse,
	method: string | undefined,
	statusCode: number,
	body: string | Buffer,
	contentType = "text/plain; charset=utf-8",
): void {
	res.statusCode = statusCode;
	res.setHeader("Content-Type", contentType);
	res.setHeader("Cache-Control", "no-store");
	res.setHeader("X-Content-Type-Options", "nosniff");

	if (method === "HEAD") {
		res.end();
		return;
	}

	res.end(body);
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
