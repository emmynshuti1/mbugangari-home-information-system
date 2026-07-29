const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");

const notFound = require("./middleware/notFound");

const express = require("express");

const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const path = require("path");

const galleryRoutes = require("./routes/galleryRoutes");

const houseRoutes = require("./routes/houseRoutes");

const roomRoutes = require("./routes/roomRoutes");

const materialRoutes = require("./routes/materialRoutes");

const historyRoutes = require("./routes/historyRoutes");

const nearbyPlaceRoutes = require("./routes/nearbyPlaceRoutes");

const app = express();

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

require("./config/db");

app.use(cors({
    origin: [
        "http://localhost:5000", 
        "http://127.0.0.1:5000",
        "https://mbugangari-home-api.onrender.com"
    ],
    credentials: true
}));

app.set('trust proxy', 1); 

app.use(helmet());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/gallery", galleryRoutes);

app.use("/api/houses", houseRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/materials", materialRoutes);

app.use("/api/history", historyRoutes);

app.use("/api/nearby-places", nearbyPlaceRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});