import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	res.json({ message: "Hello from server!", time: Date.now() });
});

export default router;
