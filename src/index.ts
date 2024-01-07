import express from "express";
import appRouter from "@/routers/index.js";

// Constants
const port = process.env.PORT || 5173;

// Create http server
const app = express();

app.use(appRouter);

// Start http server
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`);
});
