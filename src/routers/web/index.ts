import fs from "fs/promises";
import { Router } from "express";

// Constants
const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

const router = Router();

// Cached production assets
const templateHtml = isProduction
	? await fs.readFile("./dist/frontend/client/index.html", "utf-8")
	: "";
const ssrManifest = isProduction
	? await fs.readFile(
			"./dist/frontend/client/.vite/ssr-manifest.json",
			"utf-8"
	  )
	: undefined;

let vite: any;
// Add Vite or respective production middlewares
if (isProduction) {
	const compression = (await import("compression")).default;
	const sirv = (await import("sirv")).default;
	router.use(compression());
	router.use(base, sirv("./dist/frontend/client", { extensions: [] }));
} else {
	const { createServer } = await import("vite");
	vite = await createServer({
		server: { middlewareMode: true },
		appType: "custom",
		base,
	});
	router.use(vite.middlewares);
}

router.use("*", async (req, res) => {
	try {
		const url = req.originalUrl.replace(base, "");

		let template;
		let render;
		if (isProduction) {
			template = templateHtml;
			render = // @ts-ignore
				(await import("../../frontend/server/entry-server.js")).render;
		} else {
			// Always read fresh template in development
			template = await fs.readFile("./index.html", "utf-8");
			template = await vite.transformIndexHtml(url, template);
			render = (await vite.ssrLoadModule("client/entry-server.tsx"))
				.render;
		}

		const rendered = await render(url, ssrManifest);

		const html = template
			.replace(`<!--app-head-->`, rendered.head ?? "")
			.replace(`<!--app-html-->`, rendered.html ?? "");

		res.status(200).set({ "Content-Type": "text/html" }).end(html);
	} catch (err: any) {
		vite?.ssrFixStacktrace(err);
		console.log(err.stack);
		res.status(500).end(err.stack);
	}
});

export default router;
