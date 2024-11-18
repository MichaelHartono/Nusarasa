/* eslint-disable react/jsx-key */
"use client";
import RecipeCard from "@/components/recipe-card";
import { createClient } from "@/utils/supabase/client";
import { Alert, Pagination } from "flowbite-react";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { HiInformationCircle } from "react-icons/hi";

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  recipe_desc: string;
  image_url: string;
  cooking_time: number;
}

export default function Favorites() {
  const supabase = createClient();
  const [savedRecipe, setSavedRecipe] = useState<Recipe[]>([]);
  const [userId, setUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSavedRecipe = async () => {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      setUserId(user.user?.id || "");

      const { data: savedRecipes } = await supabase
        .from("saved_recipe")
        .select(
          `user_id, recipe (recipe_id, recipe_name, recipe_desc, image_url, cooking_time)`
        )
        .eq("user_id", user.user?.id);
      if (savedRecipes) {
        setSavedRecipe(
          savedRecipes.map((savedRecipe: any) => savedRecipe.recipe)
        );
        setLoading(false);
      }
    };
    fetchSavedRecipe();
  }, []);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    savedRecipe?.length || 0
  );

  const currentRecipes = savedRecipe?.slice(startIndex, endIndex);
  const totalPages = Math.ceil((savedRecipe?.length || 0) / itemsPerPage);

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <h1 className="text-4xl mb-4 font-bold">Favorited Recipes</h1>
      {!isLoading ? (
        <div>
          {currentRecipes?.length === 0 ? (
            <div className="flex justify-center">
              <Alert color="failure" icon={HiInformationCircle}>
                <span className="font-medium">No Recipes Found!</span>
              </Alert>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {currentRecipes?.map((recipe) => (
                  <RecipeCard
                    key={`${recipe.recipe_name}-${recipe.recipe_id}`}
                    {...recipe}
                  />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center"><AiOutlineLoading className="animate-spin" size={100}/></div>
      )}
    </div>
  );
}
