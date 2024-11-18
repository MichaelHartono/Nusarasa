'use client'
import {
  Label,
  TextInput,
  Textarea,
  Button,
  FileInput,
  Tabs,
  TabsRef,
} from "flowbite-react";
import { RiImageAddFill } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoAdd } from "react-icons/io5";
import { IoTrashBin } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import UpdateIngredientDetail from "@/components/update-ingredient-detail";
import UpdateUtensilDetail from "@/components/update-utensil-detail";
import UpdateCategoryDetail from "@/components/update-category-detail";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

type Props = {
  params: { slug: number };
};

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  recipe_desc: string;
  instructions: string[];
  image_url: string;
  cooking_time: number;
}

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
}

interface Utensil {
  utensil_id: number;
  utensil_name: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface UtensilDetails {
  recipe_id: number;
  utensil_id: number;
}

interface CategoryDetails {
  recipe_id: number;
  category_id: number;
}

export default function UpdateRecipe({ params }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [recipeName, setRecipeName] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [cookingTime, setCookingTime] = useState<number | "">(0);

  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const [instructions, setInstructions] = useState<string>("");
  const [addedInstructions, setAddedInstructions] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const tabsRef = useRef<TabsRef>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchRecipeData = async () => {
      const { data: recipe } = await supabase
        .from("recipe")
        .select("*")
        .match({ recipe_id: params.slug })
        .single();
      if (recipe) {
        setImageUrl(recipe.image_url);
        setRecipeName(recipe.recipe_name);
        setRecipeDesc(recipe.recipe_desc);
        setCookingTime(recipe.cooking_time);

        if (recipe.instructions && recipe.instructions.length > 0) {
          setAddedInstructions(recipe.instructions);
        }
      } else {
        setErrors({ message: "Recipe not found" });
      }
    };
    fetchRecipeData();
  }, []);

  const handleInsertImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (fileType !== "image/png" && fileType !== "image/jpeg") {
        setErrors({ image: "Only .png or .jpg files are allowed" });
        return;
      }

      const fileName = `${recipeName
        .trim()
        .replace(/\s+/g, "_")}_${Date.now()}.png`;
      setFileName(fileName);

      const { data, error } = await supabase.storage
        .from("image/recipeImage")
        .upload(fileName, file);

      const { data: url } = supabase.storage
        .from("image")
        .getPublicUrl(`recipeImage/${fileName}`);

      if (url) {
        setImageUrl(url.publicUrl);
        setErrors((prevErrors) => ({ ...prevErrors, image: "" }));
      } else {
        setErrors({ message: "Failed to upload image" });
      }
    }
  };

  const handleRemoveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.storage
      .from("image")
      .remove([`recipeImage/${fileName}`]);

    setImageUrl("");
    setFileName("");
    setErrors((prevErrors) => ({
      ...prevErrors,
      image: "Recipe Image is required",
    }));
  };

  const handleAddInstruction = () => {
    if (
      instructions.trim() !== "" &&
      !addedInstructions.includes(instructions.trim())
    ) {
      const newInstruction = instructions.trim();
      setAddedInstructions([...addedInstructions, newInstruction]);
      setInstructions("");
    }
  };

  const handleEditInstruction = (index: number, value: string) => {
    const updatedInstructions = [...addedInstructions];
    updatedInstructions[index] = value;
    setAddedInstructions(updatedInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!recipeName.trim()) {
      newErrors.recipeName = "Recipe Name is required";
    }
    if (!cookingTime || cookingTime <= 0) {
      newErrors.cookingTime = "Cooking Time must be greater than 0";
    }
    if (!recipeDesc.trim()) {
      newErrors.recipeDesc = "Recipe Description is required";
    }
    if (addedInstructions.length === 0) {
      newErrors.instructions = "At least one instruction is required";
    }
    if (!fileName && !imageUrl) {
      newErrors.image = "Recipe Image is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { data } = await supabase
      .from("recipe")
      .update({
        recipe_name: recipeName,
        recipe_desc: recipeDesc,
        instructions: addedInstructions,
        image_url: imageUrl,
        cooking_time: cookingTime,
      })
      .match({ recipe_id: params.slug })
      .single();

    toast.success("Recipe Details updated successfully!");

    tabsRef.current?.setActiveTab(1);
  };

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <h1 className="text-4xl mb-4 font-extrabold text-black gap-4">
        Update Recipe
      </h1>
      <div className="border-2 border-slate-300 rounded-lg p-6">
        <Tabs
          style="underline"
          ref={tabsRef}
          onActiveTabChange={(tab) => setActiveTab(tab)}
        >
          <Tabs.Item active title="Recipe Details">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-rows-4">
                <div>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-4">
                      <div className="mb-2 block">
                        <Label htmlFor="recipeName" value="Recipe Name" />
                      </div>
                      <TextInput
                        id="recipeName"
                        type="text"
                        placeholder="Input Recipe Name"
                        sizing="md"
                        value={recipeName}
                        onChange={(e) => {
                          setErrors((prev) => ({
                            ...prev,
                            recipeName: "",
                          }));
                          setRecipeName(e.target.value);
                        }}
                      />
                      {errors.recipeName && (
                        <p className="text-red-500 mt-2">
                          {errors.recipeName}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="mb-2 block">
                        <Label htmlFor="cookingTime" value="Cooking Time" />
                      </div>
                      <div className="grid grid-cols-6 gap-2 items-center">
                        <div className="col-span-5">
                          <TextInput
                            id="cookingTime"
                            type="number"
                            sizing="md"
                            min="0"
                            value={cookingTime}
                            defaultValue={0}
                            onChange={(e) => {
                              setErrors((prev) => ({
                                ...prev,
                                cookingTime: "",
                              }));
                              setCookingTime(
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value)
                              );
                            }}
                          />
                        </div>
                        <div className="col-span-1">Minutes</div>
                      </div>
                      {errors.cookingTime && (
                        <p className="text-red-500 mt-2">
                          {errors.cookingTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row-span-3">
                  <div className="my-2 block">
                    <Label htmlFor="recipeImage" value="Recipe Image" />
                  </div>
                  <div className="flex w-1/2 mx-auto items-center justify-center">
                    {imageUrl ? (
                      <div className="relative">
                        <Image
                          src={imageUrl}
                          alt={imageUrl}
                          width={500}
                          height={500}
                          className="rounded-lg"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 m-4 px-2 py-1 bg-red-700 text-white rounded-md shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <IoIosClose size={20} />
                        </button>
                      </div>
                    ) : (
                      <Label
                        htmlFor="recipeImage"
                        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                      >
                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                          <RiImageAddFill size={50} />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Add Recipe Image
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            .PNG or .JPG
                          </p>
                        </div>
                        <FileInput
                          id="recipeImage"
                          className="hidden"
                          onChange={handleInsertImage}
                        />
                      </Label>
                    )}
                  </div>
                  {errors.image && (
                    <p className="text-red-500 text-center mt-2">
                      {errors.image}
                    </p>
                  )}
                </div>
                <div className="row-span-1">
                  <div className="my-2 block">
                    <Label
                      htmlFor="recipeDescription"
                      value="Recipe Description"
                    />
                  </div>
                  <Textarea
                    id="recipeDescription"
                    placeholder="Input Recipe Description..."
                    rows={4}
                    className="resize-none"
                    value={recipeDesc}
                    onChange={(e) => {
                      setErrors((prev) => ({ ...prev, recipeDesc: "" }));
                      setRecipeDesc(e.target.value);
                    }}
                  />
                  {errors.recipeDesc && (
                    <p className="text-red-500 mt-2">{errors.recipeDesc}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="border-b-2 border-nusa-red mb-4">
                  <h2 className="text-xl font-semibold text-black mb-2">
                    Recipe Instructions
                  </h2>
                </div>
                <div>
                  <div className="flex mb-4">
                    <TextInput
                      placeholder="Add Instructions"
                      className="me-2 flex-grow"
                      onChange={(e) => {
                        setErrors((prev) => ({ ...prev, instructions: "" }));
                        setInstructions(e.target.value);
                      }}
                      value={instructions}
                    />
                    <Button onClick={handleAddInstruction} color="light">
                      <IoAdd size={20} strokeWidth={10} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {addedInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-center">
                        <TextInput
                          className="me-2 flex-grow"
                          value={instruction}
                          onChange={(e) =>
                            handleEditInstruction(index, e.target.value)
                          }
                        />
                        <Button
                          className="ml-auto"
                          onClick={() =>
                            setAddedInstructions(
                              addedInstructions.filter((item, i) => i !== index)
                            )
                          }
                        >
                          <IoTrashBin size={20} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {errors.instructions && (
                    <p className="text-red-500">{errors.instructions}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end items-center mt-2 mx-6">
                <div className="flex gap-2">
                  <Button outline as={Link} href="/manage-recipe">
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </form>
          </Tabs.Item>
          <Tabs.Item title="Recipe Ingredients">
            <UpdateIngredientDetail recipeId={params.slug} />
          </Tabs.Item>
          <Tabs.Item title="Recipe Utensils">
            <UpdateUtensilDetail recipeId={params.slug} />
          </Tabs.Item>
          <Tabs.Item title="Recipe Categories">
            <UpdateCategoryDetail recipeId={params.slug} />
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );
}
