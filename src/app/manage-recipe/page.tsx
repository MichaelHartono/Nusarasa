"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "flowbite-react/components/Button";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Alert,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { HiInformationCircle } from "react-icons/hi";
import ConfirmationModal from "@/components/confirmation-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineLoading } from "react-icons/ai";

interface Recipe {
  recipe_id: number;
  recipe_name: string;
  recipe_desc: string;
  instructions: string[];
  image_url: string;
  cooking_time: number;
}

export default function ManageRecipe() {
  const supabase = createClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentRecipeName, setCurrentRecipeName] = useState<string>("");
  const [currentRecipeId, setCurrentRecipeId] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getRecipes = async () => {
    setLoading(true);
    const { data: recipes } = await supabase.from("recipe").select("*");
    setRecipes(recipes || []);
    setLoading(false);
  };

  const getRecipeDetailsById = async (recipeId: number) => {
    const { data: recipe } = await supabase
      .from("recipe")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();
    setCurrentRecipeName(recipe.recipe_name);
  };

  useEffect(() => {
    getRecipes();
  }, []);

  const deleteRecipe = async (currentRecipeId: number) => {
    await supabase.from("recipe").delete().eq("recipe_id", currentRecipeId);
    getRecipes();
    setOpenDeleteModal(false);
    toast.success("Recipe deleted successfully!");
  };

  const openDeleteConfirmation = (recipeId: number) => {
    setCurrentRecipeId(recipeId);
    getRecipeDetailsById(recipeId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecipes = filteredRecipes?.slice(startIndex, endIndex);
  const totalPages = Math.ceil((filteredRecipes?.length || 0) / itemsPerPage);

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(page);
  };

  useEffect(() => {
    const filtered = recipes?.filter((recipe) =>
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered) {
      setFilteredRecipes(filtered);
    }

    if (currentPage > Math.ceil((filtered?.length || 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [recipes, searchTerm, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold text-black py-8">
        Manage Recipes
      </h1>
      <ConfirmationModal
        show={openDeleteModal}
        onClose={closeDeleteConfirmation}
        onConfirm={() => deleteRecipe(currentRecipeId || 0)}
        itemName={currentRecipeName}
      />
      {!isLoading ? (
        <div>
          <div className="flex justify-between mb-8">
            <div className="w-1/2">
              <TextInput
                rightIcon={IoMdSearch}
                placeholder="Search recipe name"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button as={Link} href="/manage-recipe/add" color="success">
              <FaPlus className="mr-2 h-5 w-5" />
              Recipe
            </Button>
          </div>
          {filteredRecipes?.length === 0 ? (
            <div className="flex justify-center">
              <Alert color="failure" icon={HiInformationCircle}>
                <span className="font-medium">No Recipes Found!</span>
              </Alert>
            </div>
          ) : (
            <>
              <Table
                hoverable
                className="w-full text-sm text-gray-500 rounded-lg"
              >
                <TableHead className="text-nowrap">
                  <TableHeadCell>Recipe name</TableHeadCell>
                  <TableHeadCell>Recipe Image</TableHeadCell>
                  <TableHeadCell>Recipe Description</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {currentRecipes?.map((recipe: Recipe) => (
                    <TableRow key={recipe.recipe_id}>
                      <TableCell className="whitespace-nowrap font-medium text-gray-900">
                        {recipe.recipe_name}
                      </TableCell>
                      <TableCell className="w-24 sm:w-32 md:w-48 lg:w-64 xl:w-80">
                        <div className="h-24 w-24 sm:h-32 sm:w-32 md:h-48 md:w-48 lg:h-64 lg:w-64 xl:h-80 xl:w-80 relative">
                          <Image
                            className="object-cover rounded-lg"
                            src={recipe.image_url}
                            alt={recipe.recipe_name}
                            layout="fill"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{recipe.recipe_desc}</TableCell>
                      <TableCell>
                        <div className="flex flex-row gap-2">
                          <Button
                            color="blue"
                            as={Link}
                            href={`/manage-recipe/update/${recipe.recipe_id}`}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            color="failure"
                            onClick={() =>
                              openDeleteConfirmation(recipe.recipe_id)
                            }
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
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
