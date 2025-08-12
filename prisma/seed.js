const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.banner.createMany({
    data: [
      {
        imageUrl: "https://cdn.example.com/banner1.jpg",
        alt: "Promo 1",
        position: 1,
      },
      {
        imageUrl: "https://cdn.example.com/banner2.jpg",
        alt: "Promo 2",
        position: 2,
      },
    ],
  });

  await prisma.trip.create({
    data: {
      title: "Beach Paradise",
      description: "5 days at a sunny beach",
      location: "Bali",
      startDate: new Date("2025-09-10"),
      endDate: new Date("2025-09-15"),
      price: 499.99,
      images: { create: [{ url: "https://cdn.example.com/trip1-1.jpg" }] },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
