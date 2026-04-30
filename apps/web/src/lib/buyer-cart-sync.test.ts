import { describe, expect, it } from "vitest";

import { mapBuyerCartItemsToLines } from "@/lib/buyer-cart-sync";

describe("mapBuyerCartItemsToLines", () => {
  it("maps enriched API items to cart lines with combined variant label", () => {
    expect(
      mapBuyerCartItemsToLines([
        {
          productName: "Premium Rice",
          productVariantId: "v-rice",
          quantity: 4,
          unitPrice: "525.00",
          variantLabel: "5kg",
          variantUnit: "pack"
        },
        {
          productName: "Bandage",
          productVariantId: "v-med",
          quantity: 1,
          unitPrice: "40",
          variantLabel: "10pc",
          variantUnit: "box"
        }
      ])
    ).toEqual([
      {
        productName: "Premium Rice",
        productVariantId: "v-rice",
        quantity: 4,
        unitPrice: 525,
        variantLabel: "5kg · pack"
      },
      {
        productName: "Bandage",
        productVariantId: "v-med",
        quantity: 1,
        unitPrice: 40,
        variantLabel: "10pc · box"
      }
    ]);
  });

  it("ignores invalid rows", () => {
    expect(
      mapBuyerCartItemsToLines([
        { quantity: 1, productVariantId: "" },
        { productVariantId: "ok", quantity: 0 },
        null,
        "x"
      ])
    ).toEqual([]);
  });

  it("returns empty for non-array", () => {
    expect(mapBuyerCartItemsToLines(undefined)).toEqual([]);
    expect(mapBuyerCartItemsToLines({})).toEqual([]);
  });
});
