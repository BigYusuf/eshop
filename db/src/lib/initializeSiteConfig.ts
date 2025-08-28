import { models } from "@./db";
import { categoriesData } from "../data/categoryData";

export async function ensureDefaultCategories() {
  try {
    const count = await models.Category.count();
    if (count === 0) {
      console.log("⚡ Seeding default categories...");

      for (const cat of categoriesData) {
        const category = await models.Category.create({
          name: cat.name,
          description: cat.description,
        });

        // create subcategories for this category
        await Promise.all(
          cat.subcategories.map((sub) =>
            models.SubCategory.create({
              name: sub.name,
              categoryId: category.id,
            })
          )
        );
      }

      console.log("✅ Default categories created.");
    } else {
      console.log("ℹ️ Categories already exist, skipping.");
    }
  } catch (error) {
    console.log("Something went wrong with creating categories", error);
  }
}
