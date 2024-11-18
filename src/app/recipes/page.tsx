"use client";
import RecipeCard from "@/components/recipe-card";
import { createClient } from "@/utils/supabase/client";
import { Alert, Button, Dropdown, Pagination, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";
import { IoIosClose, IoMdSearch } from "react-icons/io";
import { LuAlarmMinus, LuAlarmPlus } from "react-icons/lu";
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

export default function Recipes() {
  const supabase = createClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchRecipeName, setSearchRecipeName] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("Name");
  const [searchIngredients, setSearchIngredients] = useState<string>("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchUtensils, setSearchUtensils] = useState<string>("");
  const [selectedUtensils, setSelectedUtensils] = useState<string[]>([]);
  const [searchCategories, setSearchCategories] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minCookingTime, setMinCookingTime] = useState<string>("");
  const [maxCookingTime, setMaxCookingTime] = useState<string>("");

  const [isLoading, setLoading] = useState(false);

  const getRecipes = async () => {
    setLoading(true);
    const { data: fetchedRecipes } = await supabase.from("recipe").select(
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
    );
    setRecipes(fetchedRecipes || []);
    setLoading(false);
  };

  useEffect(() => {
    getRecipes();
  }, []);

  const handleSelectFilter = (item: string) => {
    setSelectedFilter(item);
    setSearchRecipeName("");
  };

  const handleAddIngredient = () => {
    if (searchIngredients.trim() === "") {
      toast.error("Ingredient cannot be empty!");
      return;
    }
    if (
      searchIngredients.trim() !== "" &&
      !selectedIngredients.includes(searchIngredients.trim())
    ) {
      setSelectedIngredients([
        ...selectedIngredients,
        searchIngredients.trim(),
      ]);
      setSearchIngredients("");
    } else {
      toast.error("Ingredient already added!");
      setSearchIngredients("");
    }
  };

  const handleAddUtensil = () => {
    if (searchUtensils.trim() === "") {
      toast.error("Utensil cannot be empty!");
      return;
    }
    if (
      searchUtensils.trim() !== "" &&
      !selectedUtensils.includes(searchUtensils.trim())
    ) {
      setSelectedUtensils([...selectedUtensils, searchUtensils.trim()]);
      setSearchUtensils("");
    } else {
      toast.error("Utensil already added!");
      setSearchUtensils("");
    }
  };

  const handleAddCategory = () => {
    if (searchCategories.trim() === "") {
      toast.error("Category cannot be empty!");
      return;
    }
    if (
      searchCategories.trim() !== "" &&
      !selectedCategories.includes(searchCategories.trim())
    ) {
      setSelectedCategories([...selectedCategories, searchCategories.trim()]);
      setSearchCategories("");
    } else {
      toast.error("Category already added!");
      setSearchCategories("");
    }
  };

  const filteredRecipes = recipes?.filter((recipe) => {
    if (selectedFilter === "Name") {
      return recipe.recipe_name
        .toLowerCase()
        .includes(searchRecipeName.toLowerCase());
    } else if (selectedFilter === "Ingredients") {
      if (selectedIngredients.length === 0) return true;
      return selectedIngredients.every((ingredient) =>
        recipe.ingredient_detail.some((ingredientDetail) =>
          ingredientDetail.ingredient.ingredient_name
            .toLowerCase()
            .includes(ingredient.toLowerCase())
        )
      );
    } else if (selectedFilter === "Utensils") {
      if (selectedUtensils.length === 0) return true;
      return selectedUtensils.every((utensil) =>
        recipe.utensil_detail.some((utensilDetail) =>
          utensilDetail.utensil.utensil_name
            .toLowerCase()
            .includes(utensil.toLowerCase())
        )
      );
    } else if (selectedFilter === "Categories") {
      if (selectedCategories.length === 0) return true;
      return selectedCategories.every((category) =>
        recipe.category_detail.some((categoryDetail) =>
          categoryDetail.category.category_name
            .toLowerCase()
            .includes(category.toLowerCase())
        )
      );
    } else if (selectedFilter === "Cooking Time") {
      const minTime = minCookingTime ? parseInt(minCookingTime, 10) : 0;
      const maxTime = maxCookingTime ? parseInt(maxCookingTime, 10) : Infinity;
      return recipe.cooking_time >= minTime && recipe.cooking_time <= maxTime;
    }
  });

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredRecipes?.length || 0
  );

  const currentRecipes = filteredRecipes?.slice(startIndex, endIndex);
  const totalPages = Math.ceil((filteredRecipes?.length || 0) / itemsPerPage);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(page);
  };

  useEffect(() => {
    const filterRecipes = () => {
      if (!recipes) return [];

      return recipes.filter((recipe) => {
        if (selectedFilter === "Name") {
          return recipe.recipe_name
            .toLowerCase()
            .includes(searchRecipeName.toLowerCase());
        } else if (selectedFilter === "Ingredients") {
          if (selectedIngredients.length === 0) return true;
          return selectedIngredients.every((ingredient) =>
            recipe.ingredient_detail.some((ingredientDetail) =>
              ingredientDetail.ingredient.ingredient_name
                .toLowerCase()
                .includes(ingredient.toLowerCase())
            )
          );
        } else if (selectedFilter === "Utensils") {
          if (selectedUtensils.length === 0) return true;
          return selectedUtensils.every((utensil) =>
            recipe.utensil_detail.some((utensilDetail) =>
              utensilDetail.utensil.utensil_name
                .toLowerCase()
                .includes(utensil.toLowerCase())
            )
          );
        } else if (selectedFilter === "Categories") {
          if (selectedCategories.length === 0) return true;
          return selectedCategories.every((category) =>
            recipe.category_detail.some((categoryDetail) =>
              categoryDetail.category.category_name
                .toLowerCase()
                .includes(category.toLowerCase())
            )
          );
        }
      });
    };

    const filtered = filterRecipes();

    if (currentPage > Math.ceil((filtered?.length || 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [
    recipes,
    searchRecipeName,
    selectedFilter,
    selectedIngredients,
    selectedUtensils,
    selectedCategories,
    minCookingTime,
    maxCookingTime,
    currentPage,
    itemsPerPage,
  ]);

  return (
    <div className="min-h-screen mx-auto max-w-7xl px-4 md:px-0">
      <div className="flex flex-wrap items-center mb-4">
        <div className="w-full md:w-auto mb-2 md:mb-0 md:me-2">
          <Dropdown label={`Filter by: ${selectedFilter}`}>
            <Dropdown.Item onClick={() => handleSelectFilter("Name")}>
              Name
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSelectFilter("Ingredients")}>
              Ingredients
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSelectFilter("Utensils")}>
              Utensils
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSelectFilter("Categories")}>
              Categories
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSelectFilter("Cooking Time")}>
              Cooking Time
            </Dropdown.Item>
          </Dropdown>
        </div>
        <div className="w-full md:w-auto mb-2 md:mb-0">
          {selectedFilter === "Name" && (
            <TextInput
              rightIcon={IoMdSearch}
              placeholder="Search recipe name"
              onChange={(e) => setSearchRecipeName(e.target.value)}
            />
          )}
          {selectedFilter === "Ingredients" && (
            <div>
              <div className="flex">
                <TextInput
                  placeholder="Search ingredients"
                  onChange={(e) => setSearchIngredients(e.target.value)}
                  className="me-1"
                  value={searchIngredients}
                />
                <Button
                  onClick={handleAddIngredient}
                  className="flex justify-center items-center"
                >
                  <FaPlus />
                </Button>
              </div>
            </div>
          )}
          {selectedFilter === "Utensils" && (
            <div>
              <div className="flex">
                <TextInput
                  placeholder="Search utensils"
                  onChange={(e) => setSearchUtensils(e.target.value)}
                  className="me-1"
                  value={searchUtensils}
                />
                <Button
                  onClick={handleAddUtensil}
                  className="flex justify-center items-center"
                >
                  <FaPlus />
                </Button>
              </div>
            </div>
          )}
          {selectedFilter === "Categories" && (
            <div className="flex items-center">
              <div className="flex">
                <TextInput
                  placeholder="Search categories"
                  onChange={(e) => setSearchCategories(e.target.value)}
                  className="me-1"
                  value={searchCategories}
                />
                <Button
                  onClick={handleAddCategory}
                  className="flex justify-center items-center"
                >
                  <FaPlus />
                </Button>
              </div>
              <div className="ms-2 grid"></div>
            </div>
          )}
          {selectedFilter === "Cooking Time" && (
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                rightIcon={LuAlarmMinus}
                placeholder="Min"
                value={minCookingTime}
                onChange={(e) => setMinCookingTime(e.target.value)}
              />
              <TextInput
                type="number"
                rightIcon={LuAlarmPlus}
                placeholder="Max"
                value={maxCookingTime}
                onChange={(e) => setMaxCookingTime(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      {selectedFilter === "Ingredients" && (
        <div className="my-2">
          {selectedIngredients.map((ingredient, index) => (
            <div
              key={index}
              className="inline-flex items-center border-2 border-nusa-red rounded-md px-2 py-1 mr-2"
            >
              <span className="mr-1">{ingredient}</span>
              <button
                onClick={() =>
                  setSelectedIngredients(
                    selectedIngredients.filter((item) => item !== ingredient)
                  )
                }
              >
                <IoIosClose color="#8C2B2B" />
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedFilter === "Utensils" && (
        <div className="my-2">
          {selectedUtensils.map((utensil, index) => (
            <div
              key={index}
              className="inline-flex items-center border-2 border-nusa-red rounded-md px-2 py-1 mr-2"
            >
              <span className="mr-1">{utensil}</span>
              <button
                onClick={() =>
                  setSelectedUtensils(
                    selectedUtensils.filter((item) => item !== utensil)
                  )
                }
              >
                <IoIosClose color="#8C2B2B" />
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedFilter === "Categories" && (
        <div className="my-2">
          {selectedCategories.map((category, index) => (
            <div
              key={index}
              className="inline-flex items-center border-2 border-nusa-red rounded-md px-2 py-1 mr-2"
            >
              <span className="mr-1">{category}</span>
              <button
                onClick={() =>
                  setSelectedCategories(
                    selectedCategories.filter((item) => item !== category)
                  )
                }
              >
                <IoIosClose color="#8C2B2B" />
              </button>
            </div>
          ))}
        </div>
      )}
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
        <div className="flex justify-center">
          <AiOutlineLoading className="animate-spin" size={100} />
        </div>
      )}
    </div>
  );
}
