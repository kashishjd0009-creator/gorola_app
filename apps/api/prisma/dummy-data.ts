import { PrismaClient } from "@prisma/client";

export async function seedDummyData(prisma: PrismaClient, storeAId: string, storeBId: string) {
  // Wipe existing catalog data (respecting FK constraints)
  await prisma.stockMovement.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});

  // -------------------------
  // CATEGORIES
  // -------------------------
  const groceriesCategory = await prisma.category.upsert({
    where: { slug: "groceries" },
    update: { imageUrl: "https://picsum.photos/seed/groceries/400/300" },
    create: {
      slug: "groceries",
      name: "Groceries",
      imageUrl: "https://picsum.photos/seed/groceries/400/300",
      displayOrder: 1,
      isActive: true
    }
  });

  const medicalCategory = await prisma.category.upsert({
    where: { slug: "medical" },
    update: { imageUrl: "https://picsum.photos/seed/medical/400/300" },
    create: {
      slug: "medical",
      name: "Medical",
      imageUrl: "https://picsum.photos/seed/medical/400/300",
      displayOrder: 2,
      isActive: true
    }
  });

  // -------------------------
  // SUBCATEGORIES - Groceries
  // -------------------------
  const subGrocRiceAtta = await prisma.subCategory.upsert({
    where: { slug: "rice-atta" },
    update: { categoryId: groceriesCategory.id },
    create: {
      slug: "rice-atta",
      name: "Rice, Atta & Dals",
      imageUrl: "https://picsum.photos/seed/rice-atta/200/200",
      categoryId: groceriesCategory.id,
      displayOrder: 1,
    }
  });

  const subGrocSnacks = await prisma.subCategory.upsert({
    where: { slug: "snacks" },
    update: { categoryId: groceriesCategory.id },
    create: {
      slug: "snacks",
      name: "Snacks & Biscuits",
      imageUrl: "https://picsum.photos/seed/snacks/200/200",
      categoryId: groceriesCategory.id,
      displayOrder: 2,
    }
  });

  const subGrocBeverages = await prisma.subCategory.upsert({
    where: { slug: "beverages" },
    update: { categoryId: groceriesCategory.id },
    create: {
      slug: "beverages",
      name: "Beverages",
      imageUrl: "https://picsum.photos/seed/beverages/200/200",
      categoryId: groceriesCategory.id,
      displayOrder: 3,
    }
  });

  // -------------------------
  // SUBCATEGORIES - Medical
  // -------------------------
  const subMedPain = await prisma.subCategory.upsert({
    where: { slug: "pain-relief" },
    update: { categoryId: medicalCategory.id },
    create: {
      slug: "pain-relief",
      name: "Pain Relief",
      imageUrl: "https://picsum.photos/seed/pain-relief/200/200",
      categoryId: medicalCategory.id,
      displayOrder: 1,
    }
  });

  const subMedFirstAid = await prisma.subCategory.upsert({
    where: { slug: "first-aid" },
    update: { categoryId: medicalCategory.id },
    create: {
      slug: "first-aid",
      name: "First Aid",
      imageUrl: "https://picsum.photos/seed/first-aid/200/200",
      categoryId: medicalCategory.id,
      displayOrder: 2,
    }
  });

  const subMedSupplements = await prisma.subCategory.upsert({
    where: { slug: "supplements" },
    update: { categoryId: medicalCategory.id },
    create: {
      slug: "supplements",
      name: "Supplements",
      imageUrl: "https://picsum.photos/seed/supplements/200/200",
      categoryId: medicalCategory.id,
      displayOrder: 3,
    }
  });

  // -------------------------
  // PRODUCTS HELPER
  // -------------------------
  const createProduct = async (
    id: string,
    storeId: string,
    categoryId: string,
    subCategoryId: string,
    name: string,
    price: string,
    stockQty: number,
    unit: string
  ) => {
    return prisma.product.upsert({
      where: { id },
      update: { categoryId, subCategoryId },
      create: {
        id,
        storeId,
        categoryId,
        subCategoryId,
        name,
        description: `Premium ${name} for your daily needs.`,
        imageUrl: `https://picsum.photos/seed/${id}/400/400`,
        isActive: true,
        variants: {
          create: [{ label: unit, price, stockQty, unit, isActive: true }]
        }
      }
    });
  };

  // -------------------------
  // PRODUCTS - Groceries (Rice & Atta)
  // -------------------------
  await createProduct("prod_rice_1", storeAId, groceriesCategory.id, subGrocRiceAtta.id, "Basmati Rice Premium", "525.00", 40, "5 kg");
  await createProduct("prod_rice_2", storeAId, groceriesCategory.id, subGrocRiceAtta.id, "Daily Sona Masoori Rice", "450.00", 30, "5 kg");
  await createProduct("prod_atta_1", storeAId, groceriesCategory.id, subGrocRiceAtta.id, "Whole Wheat Atta", "220.00", 50, "5 kg");
  await createProduct("prod_atta_2", storeAId, groceriesCategory.id, subGrocRiceAtta.id, "Multigrain Atta", "260.00", 25, "5 kg");
  await createProduct("prod_dal_1", storeAId, groceriesCategory.id, subGrocRiceAtta.id, "Yellow Toor Dal", "140.00", 60, "1 kg");

  // -------------------------
  // PRODUCTS - Groceries (Snacks)
  // -------------------------
  await createProduct("prod_snack_1", storeAId, groceriesCategory.id, subGrocSnacks.id, "Potato Chips Salted", "20.00", 100, "1 pack");
  await createProduct("prod_snack_2", storeAId, groceriesCategory.id, subGrocSnacks.id, "Spicy Bhujia", "45.00", 80, "200 g");
  await createProduct("prod_snack_3", storeAId, groceriesCategory.id, subGrocSnacks.id, "Chocolate Chip Cookies", "60.00", 50, "150 g");
  await createProduct("prod_snack_4", storeAId, groceriesCategory.id, subGrocSnacks.id, "Digestive Biscuits", "40.00", 70, "250 g");
  await createProduct("prod_snack_5", storeAId, groceriesCategory.id, subGrocSnacks.id, "Roasted Peanuts", "35.00", 90, "200 g");

  // -------------------------
  // PRODUCTS - Groceries (Beverages)
  // -------------------------
  await createProduct("prod_bev_1", storeAId, groceriesCategory.id, subGrocBeverages.id, "Assam Tea Leaves", "150.00", 40, "250 g");
  await createProduct("prod_bev_2", storeAId, groceriesCategory.id, subGrocBeverages.id, "Instant Coffee", "180.00", 30, "50 g");
  await createProduct("prod_bev_3", storeAId, groceriesCategory.id, subGrocBeverages.id, "Mango Juice", "110.00", 50, "1 L");
  await createProduct("prod_bev_4", storeAId, groceriesCategory.id, subGrocBeverages.id, "Cola Soft Drink", "40.00", 100, "750 ml");
  await createProduct("prod_bev_5", storeAId, groceriesCategory.id, subGrocBeverages.id, "Sparkling Water", "60.00", 80, "1 L");

  // -------------------------
  // PRODUCTS - Medical (Pain Relief)
  // -------------------------
  await createProduct("prod_pain_1", storeBId, medicalCategory.id, subMedPain.id, "Paracetamol 650", "42.00", 120, "1 strip");
  await createProduct("prod_pain_2", storeBId, medicalCategory.id, subMedPain.id, "Ibuprofen 400", "55.00", 100, "1 strip");
  await createProduct("prod_pain_3", storeBId, medicalCategory.id, subMedPain.id, "Pain Relief Spray", "145.00", 40, "50 g");
  await createProduct("prod_pain_4", storeBId, medicalCategory.id, subMedPain.id, "Aspirin 75mg", "25.00", 150, "1 strip");
  await createProduct("prod_pain_5", storeBId, medicalCategory.id, subMedPain.id, "Muscle Relaxant Ointment", "85.00", 60, "30 g");

  // -------------------------
  // PRODUCTS - Medical (First Aid)
  // -------------------------
  await createProduct("prod_fa_1", storeBId, medicalCategory.id, subMedFirstAid.id, "Adhesive Bandages", "30.00", 200, "1 box");
  await createProduct("prod_fa_2", storeBId, medicalCategory.id, subMedFirstAid.id, "Antiseptic Liquid", "65.00", 80, "100 ml");
  await createProduct("prod_fa_3", storeBId, medicalCategory.id, subMedFirstAid.id, "Cotton Roll", "20.00", 150, "50 g");
  await createProduct("prod_fa_4", storeBId, medicalCategory.id, subMedFirstAid.id, "Medical Tape", "40.00", 100, "1 roll");
  await createProduct("prod_fa_5", storeBId, medicalCategory.id, subMedFirstAid.id, "Crepe Bandage", "90.00", 50, "1 roll");

  // -------------------------
  // PRODUCTS - Medical (Supplements)
  // -------------------------
  await createProduct("prod_sup_1", storeBId, medicalCategory.id, subMedSupplements.id, "Vitamin C 500mg", "110.00", 90, "1 strip");
  await createProduct("prod_sup_2", storeBId, medicalCategory.id, subMedSupplements.id, "Multivitamin Capsules", "250.00", 60, "1 bottle");
  await createProduct("prod_sup_3", storeBId, medicalCategory.id, subMedSupplements.id, "Calcium + D3", "140.00", 80, "1 strip");
  await createProduct("prod_sup_4", storeBId, medicalCategory.id, subMedSupplements.id, "Iron Supplements", "130.00", 70, "1 strip");
  await createProduct("prod_sup_5", storeBId, medicalCategory.id, subMedSupplements.id, "Protein Powder", "950.00", 20, "500 g");

  // -------------------------
  // ADVERTISEMENTS
  // -------------------------
  await prisma.advertisement.deleteMany({});
  await prisma.advertisement.createMany({
    data: [
      {
        id: "adv_1",
        storeId: storeAId,
        title: "Fresh Groceries Delivered",
        imageUrl: "https://fastly.picsum.photos/id/19/2500/1667.jpg?hmac=7epGozH4QjToGaBf_xb2HbFTXoV5o8n_cYzB7I4lt6g",
        linkUrl: "/categories/groceries",
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
        isApproved: true,
        isActive: true
      },
      {
        id: "adv_2",
        storeId: storeAId,
        title: "Medical Essentials at Your Door",
        imageUrl: "https://fastly.picsum.photos/id/55/4608/3072.jpg?hmac=ahGhylwdN52ULB37deeMZX6T_G7NiERtoPhwydMvUKQ",
        linkUrl: "/categories/medical",
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        isApproved: true,
        isActive: true
      },
      {
        id: "adv_3",
        storeId: storeBId,
        title: "Mountain Medico Special Offers",
        imageUrl: "https://fastly.picsum.photos/id/11/2500/1667.jpg?hmac=xxjFJtAPgshYkysU_aqx2sZir-kIOjNR9vx0te7GycQ",
        linkUrl: "/categories/medical",
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        isApproved: true,
        isActive: true
      }
    ]
  });

  console.info("Dummy data seeded successfully (30 products, 3 advertisements across 6 subcategories)");
}
