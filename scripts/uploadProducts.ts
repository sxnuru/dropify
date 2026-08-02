import XLSX from "xlsx";
import fs from "fs";

const workbook = XLSX.readFile("DreamShelf_Master_Catalog_CLEANED.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<any>(sheet);

console.log(`Loaded ${rows.length} products`);

const products = rows.map((row) => {
  const images = [
    row.Image1,
    row.Image2,
    row.Image3,
    row.Image4,
    row.Image5,
  ]
    .filter(Boolean)
    .map((img: any) => String(img).trim());

  const colors = row.Color
    ? String(row.Color)
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean)
    : [];

  const sizes = row.Size
    ? String(row.Size)
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean)
    : [];

  return {
    id: String(row.ProductID || row.SKU || row.Title)
      .trim()
      .replace(/[^\w-]/g, "-"),

    sku: row.SKU || "",

    name: row.Title || "",

    brand: row.Brand || "",

    description: row.Description || "",

    category: row.MainCategory || "",

    subcategory: row.SubCategory || "",

    price: Number(row.Price || 0),

    originalPrice: Number(row.OriginalPrice || row.Price || 0),

    discountPercent: Number(row.DiscountPercent || 0),

    sale: Number(row.DiscountPercent || 0) > 0,

    rating: Number(row.Rating || 0),

    reviewCount: Number(row.ReviewCount || 0),

    stock: Number(row.Stock || 0),

    colors,

    sizes,

    material: row.Material || "",

    gender: row.Gender || "",

    ageGroup: row.AgeGroup || "",

    tags: row.Tags
      ? String(row.Tags)
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean)
      : [],

    searchKeywords: row.SearchKeywords || "",

    featured:
      String(row.Featured).toLowerCase() === "true",

    bestSeller:
      String(row.BestSeller).toLowerCase() === "true",

    isNew:
      String(row.NewArrival).toLowerCase() === "true",

    freeShipping:
      String(row.FreeShipping).toLowerCase() === "true",

    deliveryDays: Number(row.DeliveryDays || 3),

    image: images[0] || "",

    images,

    reviews: [],

    specs: {},

    createdAt: new Date().toISOString(),
  };
});

fs.writeFileSync(
  "public/products.json",
  JSON.stringify(products, null, 2)
);

console.log(`✅ Generated products.json with ${products.length} products`);