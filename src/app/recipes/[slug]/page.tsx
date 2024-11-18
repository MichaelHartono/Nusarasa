/* eslint-disable react/jsx-key */
import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import FavoriteButton from "@/components/favorite";

type Props = {
  params: { slug: string };
};

interface CategoryDetail {
  category: {
    category_name: string;
  };
}

interface IngredientDetail {
  quantity: string;
  ingredient: {
    ingredient_name: string;
  };
}

interface UtensilDetail {
  utensil: {
    utensil_name: string;
  };
}

export default async function Recipe({ params }: Props) {
  const supabase = createClient();
  const { data: recipe } = await supabase
    .from("recipe")
    .select(
      `*,
    ingredient_detail (
      ingredient_id,
      quantity,
      ingredient:ingredient_id (ingredient_name)
    ),
    utensil_detail (
      utensil_id,
      utensil:utensil_id (utensil_name)
    ),
    category_detail (
      category_id,
      category:category_id (category_name)
    )`
    )
    .match({ recipe_id: params.slug })
    .single();

  if (!recipe) {
    return <div className="text-center">Recipe not found.</div>;
  }

  const { data: user } = await supabase.auth.getUser();

  return (
    <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="my-8 grid-cols-2">
        <div className="flex items-left justify-between">
          <h1 className="text-4xl mb-4 font-bold">{recipe.recipe_name}</h1>
          <div className="flex items-center">
            <FavoriteButton
              user_id={user.user?.id || ""}
              recipe_id={recipe.recipe_id}
            />
          </div>
        </div>
        <div className="flex items-left justify-center mb-8">
          <Image
            className="rounded-lg shadow-xl lg:min-w-[30rem] lg:min-h-[20rem]"
            width={500}
            height={300}
            alt={recipe.recipe_name}
            src={recipe.image_url}
          />
        </div>
        <div className="mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {recipe.recipe_desc}
          </p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">⏰ Cooking Time: {recipe.cooking_time} minutes</h2>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">🔖 Categories:</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.category_detail?.map(
              (category: CategoryDetail, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-nusa-red text-white rounded-full text-sm"
                >
                  {category.category.category_name}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
        <div className="bg-white border-2 border-black border-dashed p-6 shadow-lg hover:shadow-xl rounded-lg transition-shadow duration-300 overflow-hidden">
          {recipe.ingredient_detail && (
            <div className="pt-4">
              <h2 className="text-2xl font-bold text-black mb-4">
                ⭐️ Ingredients:
              </h2>
              {recipe.ingredient_detail.map((ingredient: IngredientDetail) => (
                <div className="flex justify-between mb-2 mx-6">
                  <p>
                    - {ingredient.ingredient.ingredient_name}
                  </p>
                  <p>
                    {ingredient.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border-2 border-black border-dashed p-6 shadow-lg hover:shadow-xl rounded-lg transition-shadow duration-300 overflow-hidden">
          {recipe.utensil_detail && (
            <div className="pt-4">
              <h2 className="text-2xl font-bold text-black mb-4">
                ⭐️ Utensils:
              </h2>
              {recipe.utensil_detail.map((utensil: UtensilDetail) => (
                <p className="mb-2 mx-6">
                  - {utensil.utensil.utensil_name}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-2 border-black border-dashed p-6 mb-8 shadow-lg hover:shadow-xl rounded-lg transition-shadow duration-300 overflow-hidden">
        {recipe.instructions && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-black mb-4">
              ⭐️ Instructions:
            </h2>
            {recipe.instructions.map((instruction: string, index: number) => (
              <p className="mb-2 mx-6">
                {index + 1}
                {". "}
                {instruction}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
