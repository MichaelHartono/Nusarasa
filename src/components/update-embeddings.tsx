import { createClient } from "@/utils/supabase/client";
import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  recipe_desc: string;
  instructions: string[];
  image_url: string;
  cooking_time: number;
  ingredient_detail: IngredientDetail[];
  utensil_detail: UtensilDetail[];
  category_detail: CategoryDetail[];
  saved_recipe: SavedRecipe[];
  save_count: number;
}

interface SavedRecipe {
  recipe_id: number;
  user_id: string;
}

interface IngredientDetail {
  quantity: string;
  ingredient: {
    ingredient_name: string;
  };
  ingredient_id: number;
}

interface UtensilDetail {
  utensil: {
    utensil_name: string;
  };
  utensil_id: number;
}

interface CategoryDetail {
  category: {
    category_name: string;
  };
  category_id: number;
}

interface Props {
  show: boolean;
  onClose: () => void;
}

const formatRecipeToParagraph = (recipe: Recipe) => {
  const categoryNames = recipe.category_detail
    .map((c) => c.category.category_name)
    .join(", ");

  const ingredientList = recipe.ingredient_detail
    .map((i) => `- ${i.ingredient.ingredient_name} ${i.quantity}`)
    .join("\n");

  const utensilList = recipe.utensil_detail
    .map((u) => `- ${u.utensil.utensil_name}`)
    .join("\n");

  const instructions = recipe.instructions
    .map((instruction, index) => `${index + 1}. ${instruction}`)
    .join("\n");

  return `### Recipe Name: ${recipe.recipe_name}
${recipe.recipe_name}'s Description: ${recipe.recipe_desc}
${recipe.recipe_name}'s Cooking Time: ${recipe.cooking_time} minutes
${recipe.recipe_name}'s Categories: ${categoryNames}
${recipe.recipe_name}'s Ingredients: 
${ingredientList}
${recipe.recipe_name}'s Utensils: 
${utensilList}
${recipe.recipe_name}'s Instructions: 
${instructions}
${recipe.recipe_name}'s Saved Count: ${recipe.save_count} times ###`;
};

export default function StoreEmbeddings({ show, onClose }: Props) {
  const supabase = createClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [embeddings, setEmbeddings] = useState("");
  const [isLoading, setLoading] = useState(false);

  const getRecipes = async () => {
    const { data: fetchedRecipes } = await supabase.from("recipe").select(
      `
          *,
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
          ),
          saved_recipe (recipe_id)
        `
    );

    const recipesWithSaveCount = fetchedRecipes?.map((recipe: any) => {
      return {
        ...recipe,
        save_count: recipe.saved_recipe.length,
      };
    });

    setRecipes(recipesWithSaveCount || []);
  };

  useEffect(() => {
    getRecipes();
  }, []);

  const prepareEmbeddings = () => {
    if (recipes.length > 0) {
      const formattedText = recipes
        .map((recipe) => formatRecipeToParagraph(recipe))
        .join("\n\n");
      setEmbeddings(formattedText);
    }
  };
  
  useEffect(() => {
    prepareEmbeddings();
  }, [recipes]);

  console.log(embeddings)

  const storeEmbeddings = async () => {
    setLoading(true);
    const response = await fetch("/api/embeddings", {
      method: "POST",
      body: JSON.stringify({
        text: embeddings,
      }),
    });
    if (response.ok) {
      setLoading(false);
      onClose();
      toast.success("Chatbot data updated successfully!")
    }
  };
  return (
    <Modal dismissible={false} show={show} onClose={onClose}>
      <Modal.Header>Update Confirmation</Modal.Header>
      <Modal.Body>
        Are you sure you want to update the{" "}
        <span className="text-nusa-red font-semibold italic">
          Chatbot Data
        </span>{" "}
        ?
      </Modal.Body>
      <Modal.Footer className="justify-end">
        <Button onClick={onClose} color="failure">
          Cancel
        </Button>
        <Button onClick={storeEmbeddings} color="success">
          {isLoading ? (
            <AiOutlineLoading className="animate-spin" size={18} />
          ) : (
            "Confirm"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
