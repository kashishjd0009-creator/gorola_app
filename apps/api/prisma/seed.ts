import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const storeA = await prisma.store.upsert({
    where: { id: "store_gorola_hillside_mart" },
    update: {},
    create: {
      id: "store_gorola_hillside_mart",
      name: "Hillside Mart",
      description: "Groceries and daily essentials for Mussoorie.",
      phone: "+919999000001",
      address: "Landour Road, Mussoorie",
      isActive: true
    }
  });

  const storeB = await prisma.store.upsert({
    where: { id: "store_gorola_mountain_medico" },
    update: {},
    create: {
      id: "store_gorola_mountain_medico",
      name: "Mountain Medico",
      description: "Trusted medical supplies and pharmacy items.",
      phone: "+919999000002",
      address: "Library Chowk, Mussoorie",
      isActive: true
    }
  });

  await prisma.storeOwner.upsert({
    where: { email: "owner1@gorola.in" },
    update: {},
    create: {
      email: "owner1@gorola.in",
      passwordHash: "TEMP_HASH_REPLACE_IN_AUTH_PHASE",
      storeId: storeA.id
    }
  });

  await prisma.storeOwner.upsert({
    where: { email: "owner2@gorola.in" },
    update: {},
    create: {
      email: "owner2@gorola.in",
      passwordHash: "TEMP_HASH_REPLACE_IN_AUTH_PHASE",
      storeId: storeB.id
    }
  });

  const groceriesCategory = await prisma.category.upsert({
    where: { slug: "groceries" },
    update: {},
    create: {
      slug: "groceries",
      name: "Groceries",
      emoji: "🛒",
      displayOrder: 1,
      isActive: true
    }
  });

  const medicalCategory = await prisma.category.upsert({
    where: { slug: "medical" },
    update: {},
    create: {
      slug: "medical",
      name: "Medical",
      emoji: "💊",
      displayOrder: 2,
      isActive: true
    }
  });

  const riceProduct = await prisma.product.upsert({
    where: { id: "product_hillside_premium_rice" },
    update: {},
    create: {
      id: "product_hillside_premium_rice",
      storeId: storeA.id,
      categoryId: groceriesCategory.id,
      name: "Premium Rice",
      description: "Daily staple rice, 5kg family pack.",
      imageUrl: "https://example.com/images/premium-rice.jpg",
      isActive: true,
      variants: {
        create: [
          {
            label: "5 kg pack",
            price: "525.00",
            stockQty: 40,
            unit: "pack",
            isActive: true
          }
        ]
      }
    }
  });

  const paracetamolProduct = await prisma.product.upsert({
    where: { id: "product_mountain_paracetamol_650" },
    update: {},
    create: {
      id: "product_mountain_paracetamol_650",
      storeId: storeB.id,
      categoryId: medicalCategory.id,
      name: "Paracetamol 650",
      description: "Pain and fever relief tablets.",
      imageUrl: "https://example.com/images/paracetamol-650.jpg",
      isActive: true,
      variants: {
        create: [
          {
            label: "10 tablets",
            price: "42.00",
            stockQty: 120,
            unit: "strip",
            isActive: true
          }
        ]
      }
    }
  });

  await prisma.featureFlag.createMany({
    data: [
      {
        key: "WEATHER_MODE_ACTIVE",
        value: false,
        description: "System-wide weather mode toggle.",
        updatedBy: "system"
      },
      {
        key: "RIDER_INTERFACE_ENABLED",
        value: false,
        description: "Future rider module toggle.",
        updatedBy: "system"
      },
      {
        key: "REAL_TIME_LOCATION_ENABLED",
        value: false,
        description: "Future live rider location toggle.",
        updatedBy: "system"
      },
      {
        key: "SCHEDULED_DELIVERY_ENABLED",
        value: false,
        description: "Enable scheduled delivery windows.",
        updatedBy: "system"
      },
      {
        key: "ADVERTISEMENTS_ENABLED",
        value: true,
        description: "Enable store advertisement placement.",
        updatedBy: "system"
      },
      {
        key: "OFFERS_ENABLED",
        value: true,
        description: "Enable store offers and discounts.",
        updatedBy: "system"
      },
      {
        key: "DISCOUNTS_ENABLED",
        value: true,
        description: "Enable coupon code support.",
        updatedBy: "system"
      },
      {
        key: "UPI_PAYMENT_ENABLED",
        value: false,
        description: "Enable UPI checkout option.",
        updatedBy: "system"
      },
      {
        key: "CARD_PAYMENT_ENABLED",
        value: false,
        description: "Enable card checkout option.",
        updatedBy: "system"
      }
    ],
    skipDuplicates: true
  });

  console.info("Seed completed", {
    stores: [storeA.name, storeB.name],
    sampleProducts: [riceProduct.name, paracetamolProduct.name]
  });
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
