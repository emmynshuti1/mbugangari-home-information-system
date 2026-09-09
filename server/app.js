require("./config/loadEnv");

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const pool = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const { ensureImageStorage, migrateLegacyImages } = require("./config/imageStorage");

const authRoutes = require("./routes/authRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const houseRoutes = require("./routes/houseRoutes");
const roomRoutes = require("./routes/roomRoutes");
const materialRoutes = require("./routes/materialRoutes");
const historyRoutes = require("./routes/historyRoutes");
const nearbyPlaceRoutes = require("./routes/nearbyPlaceRoutes");

const app = express();

const defaultOrigins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

const extraOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

app.use(cors({
    origin: corsOrigins,
    credentials: true
}));

app.set("trust proxy", 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: "1mb" }));

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ success: true, status: "ok" });
    } catch (error) {
        res.status(503).json({ success: false, status: "database_unavailable" });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/nearby-places", nearbyPlaceRoutes);

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.use(notFound);
app.use(errorHandler);

function assertRequiredConfig() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is required.");
        process.exit(1);
    }

    const secret = process.env.JWT_SECRET || "";
    if (secret.length < 16) {
        console.error("JWT_SECRET is required and must be at least 16 characters.");
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5000;

async function startServer() {
    assertRequiredConfig();

    try {
        await ensureImageStorage();
        await migrateLegacyImages();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Image storage setup failed:", error.message);
        process.exit(1);
    }
}

startServer();
