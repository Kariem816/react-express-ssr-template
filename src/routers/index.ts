import { Router } from "express";
import ApiRouter from "./api/index.js";
import WebRouter from "./web/index.js";

const router = Router();

router.use("/api", ApiRouter);
router.use("/", WebRouter);

export default router;
