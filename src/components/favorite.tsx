/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-key */
"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface SavedRecipeProps {
  user_id: string;
  recipe_id: number;
}

const FavoriteButton: React.FC<SavedRecipeProps> = ({ user_id, recipe_id }) => {
  const supabase = createClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [savedRecipe, setSavedRecipe] = useState<SavedRecipeProps | null>(null);

  useEffect(() => {
    const fetchSavedRecipe = async () => {
      const { data: existingFavorite, error } = await supabase
        .from("saved_recipe")
        .select("*")
        .eq("user_id", user_id)
        .eq("recipe_id", recipe_id)
        .single();

      if (existingFavorite) {
        setSavedRecipe(existingFavorite);
        setIsFavorite(true);
      } else {
        setSavedRecipe(null);
        setIsFavorite(false);
      }
    };
    fetchSavedRecipe();
  }, []);

  const addToFavorite = async (user_id: string, recipe_id: number) => {
    const { data: recipe } = await supabase
      .from("saved_recipe")
      .insert({ user_id: user_id, recipe_id: recipe_id })
      .select()
      .single();

    setSavedRecipe(recipe);
    setIsFavorite(true);

    toast.success("Recipe added to favorites!");
  };

  const removeFavorite = async (user_id: string, recipe_id: number) => {
    const { error } = await supabase
      .from("saved_recipe")
      .delete()
      .eq("user_id", user_id)
      .eq("recipe_id", recipe_id);

    setSavedRecipe(null);
    setIsFavorite(false);

    toast.error("Recipe removed from favorites!");
  };

  const handleToggleFavorite = () => {
    if (!isFavorite) {
      addToFavorite(user_id, recipe_id);
    } else {
      removeFavorite(user_id, recipe_id);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      {savedRecipe ? <GoHeartFill size={32} color="red" /> : <GoHeart size={32} color="red" />}
    </button>
  );
};

export default FavoriteButton;
