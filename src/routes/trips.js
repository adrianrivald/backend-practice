import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Helper: parse pagination
const parsePager = (q) => {
  const page = Math.max(1, parseInt(q.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize || "10", 10)));
  return { skip: (page - 1) * pageSize, take: pageSize };
};

// GET /api/trips?q=beach&start_date=2025-09-01&end_date=2025-09-30&page=1&pageSize=10
router.get("/", async (req, res) => {
  try {
    const { q, start_date, end_date } = req.query;
    const { skip, take } = parsePager(req.query);

    // build date overlap filter (trip overlaps requested range)
    const dateFilter =
      start_date && end_date
        ? {
            AND: [
              { startDate: { lte: new Date(end_date) } },
              {
                OR: [
                  { endDate: { gte: new Date(start_date) } },
                  { endDate: null }, // if a trip has no endDate
                ],
              },
            ],
          }
        : {};

    // If q present -> simple keyword search (Prisma 'contains' case-insensitive)
    if (q) {
      const where = {
        AND: [
          dateFilter,
          {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          },
        ].filter(Boolean),
      };

      const [items, total] = await Promise.all([
        prisma.trip.findMany({
          where,
          include: { images: true },
          skip,
          take,
          orderBy: { startDate: "asc" },
        }),
        prisma.trip.count({ where }),
      ]);

      return res.json({
        items,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
      });
    }

    // No q: normal listing with optional date filter
    const where = dateFilter;
    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: { images: true },
        skip,
        take,
        orderBy: { startDate: "asc" },
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET detail trip
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!trip) return res.status(404).json({ error: "Not found" });
  res.json(trip);
});

// Create new Trip
router.post("/", async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, price, images } =
      req.body;

    if (!title || !startDate) {
      return res
        .status(400)
        .json({ error: "Title and startDate are required" });
    }
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price: price ? parseFloat(price) : null,
        images:
          images && images.length > 0
            ? { create: images.map((url) => ({ url })) }
            : undefined,
      },
      include: { images: true },
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// Update trip
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, location, startDate, endDate, price } =
      req.body;

    // Basic existence check
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        location: location ?? existing.location,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        price: price !== undefined ? parseFloat(price) : existing.price,
      },
    });

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update trip" });
  }
});

// Delete trip
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // First delete trip images to maintain referential integrity
    await prisma.tripImage.deleteMany({ where: { tripId: id } });

    // Then delete trip
    await prisma.trip.delete({ where: { id } });

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

export default router;
