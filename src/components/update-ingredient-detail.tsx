/* eslint-disable react/jsx-key */
"use client";

import { createClient } from "@/utils/supabase/client";
import {
  Button,
  Modal,
  Pagination,
  Table,
  TextInput,
  Alert,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { HiInformationCircle } from "react-icons/hi";
import IngredientTable from "./ingredient-table";
import ConfirmationModal from "./confirmation-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UpdateIngredientDetailProps {
  recipeId: number;
}

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
}

interface RecipeIngredientQuantity {
  quantity: string;
}

interface RecipeIngredientDetail {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_detail: RecipeIngredientQuantity[];
}

interface IngredientDetails {
  recipe_id: number;
  ingredient_id: number;
  quantity: string;
}

const UpdateIngredientDetail: React.FC<UpdateIngredientDetailProps> = ({
  recipeId,
}) => {
  const supabase = createClient();
  const [recipeIngredientDetails, setRecipeIngredientDetails] = useState<
    RecipeIngredientDetail[]
  >([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientDetails, setIngredientDetails] = useState<
    IngredientDetails[]
  >([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingIngredientId, setDeletingIngredientId] = useState<
    number | null
  >(null);

  const [quantityErrorMessage, setQuantityErrorMessage] = useState<string>("");

  const getRecipeIngredientDetails = async () => {
    const { data, error } = await supabase
      .from("ingredient")
      .select(
        "ingredient_id, ingredient_name, ingredient_detail:ingredient_id!inner(quantity)"
      )
      .eq("ingredient_detail.recipe_id", recipeId);
    setRecipeIngredientDetails(data || []);
  };

  const getFilteredIngredients = async () => {
    const { data, error } = await supabase.from("ingredient").select("*");

    if (data) {
      const existingIngredientIds = new Set(
        recipeIngredientDetails.map((detail) => detail.ingredient_id)
      );

      const nonRecipeIngredients = data.filter(
        (ingredient) => !existingIngredientIds.has(ingredient.ingredient_id)
      );

      setIngredients(nonRecipeIngredients);
    }
  };

  useEffect(() => {
    getRecipeIngredientDetails();
  }, []);

  useEffect(() => {
    getFilteredIngredients();
  }, [recipeIngredientDetails]);

  const [ingredientErrorMessage, setIngredientErrorMessage] =
    useState<string>("");

  const insertIngredientDetails = async () => {
    if (ingredientDetails.length === 0) {
      setIngredientErrorMessage("No ingredients have been added.");
      return;
    }

    const hasEmptyQuantity = ingredientDetails.some(
      (detail) => detail.quantity.trim() === ""
    );

    if (hasEmptyQuantity) {
      setIngredientErrorMessage("Some ingredients have empty quantities.");
      return;
    }

    const { error } = await supabase
      .from("ingredient_detail")
      .insert(ingredientDetails);

    if (error) {
      setIngredientErrorMessage(
        "Error inserting ingredient details. Please try again."
      );
      return;
    }

    setIngredientErrorMessage("");
    setOpenModal(false);
    setIngredientDetails([]);
    getRecipeIngredientDetails();

    toast.success("Recipe ingredient(s) updated successfully!");
  };

  const deleteIngredientDetail = async (ingredientId: number) => {
    await supabase
      .from("ingredient_detail")
      .delete()
      .eq("ingredient_id", ingredientId)
      .eq("recipe_id", recipeId);

    getRecipeIngredientDetails();
    setOpenDeleteModal(false);
  };

  const openDeleteConfirmation = (ingredientId: number) => {
    setDeletingIngredientId(ingredientId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
    setDeletingIngredientId(null);
  };

  const deleteSelectedIngredient = () => {
    if (deletingIngredientId !== null) {
      deleteIngredientDetail(deletingIngredientId);
    }
    toast.success("Recipe ingredient(s) deleted successfully!");
  };

  const getIngredientName = () => {
    if (deletingIngredientId === null) {
      return "";
    }

    const ingredient = recipeIngredientDetails.find(
      (detail) => detail.ingredient_id === deletingIngredientId
    );

    return ingredient?.ingredient_name || "";
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredIngredients, setFilteredIngredients] = useState<
    RecipeIngredientDetail[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentIngredients = filteredIngredients.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [updatedQuantity, setUpdatedQuantity] = useState("");
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(
    null
  );

  const handleEditButtonClick = (id: number, quantity: string) => {
    if (editingIngredientId === id) {
      handleQuantityChange();
    } else {
      setEditingIngredientId(id);
      setUpdatedQuantity(quantity);
      setQuantityErrorMessage("");
    }
  };

  const handleQuantityChange = async () => {
    if (updatedQuantity.trim() === "") {
      setQuantityErrorMessage("Quantity is required");
      return;
    }

    await supabase
      .from("ingredient_detail")
      .update({ quantity: updatedQuantity })
      .eq("ingredient_id", editingIngredientId)
      .eq("recipe_id", recipeId);

    getRecipeIngredientDetails();
    setEditingIngredientId(null);

    toast.success("Ingredient quantity updated successfully!");
  };

  useEffect(() => {
    const filtered = recipeIngredientDetails?.filter((ingredient) =>
      ingredient.ingredient_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (filtered) {
      setFilteredIngredients(filtered);
    }

    if (currentPage > Math.ceil((filtered?.length || 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [recipeIngredientDetails, searchTerm, currentPage, itemsPerPage]);

  return (
    <div>
      <div className="flex justify-between mb-8">
        <div className="w-1/2">
          <TextInput
            rightIcon={IoMdSearch}
            placeholder="Search ingredient name"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button color="success" onClick={() => setOpenModal(true)}>
          <FaPlus className="mr-2 h-5 w-5" />
          Ingredient
        </Button>
        <Modal
          dismissible
          show={openModal}
          onClose={() => setOpenModal(false)}
          size="6xl"
        >
          <Modal.Header>Add Recipe Ingredient</Modal.Header>
          <Modal.Body>
            <IngredientTable
              ingredients={ingredients}
              ingredientDetails={ingredientDetails}
              setIngredientDetails={setIngredientDetails}
              recipeId={recipeId}
            />
          </Modal.Body>
          <Modal.Footer className="justify-between items-center">
            {ingredientErrorMessage ? (
              <p className="text-red-500">{ingredientErrorMessage}</p>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button color="failure" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button color="success" onClick={insertIngredientDetails}>
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
      {filteredIngredients.length === 0 ? (
        <div className="flex justify-center">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="font-medium">No Ingredients Found!</span>
          </Alert>
        </div>
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.HeadCell>Ingredient name</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentIngredients.map((ingredient) => (
                <Table.Row>
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    {ingredient.ingredient_name}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    {editingIngredientId === ingredient.ingredient_id ? (
                      <TextInput
                        type="text"
                        value={updatedQuantity}
                        onChange={(e) => {
                          setUpdatedQuantity(e.target.value);
                          setQuantityErrorMessage("");
                        }}
                        placeholder={`Input Quantity`}
                      />
                    ) : (
                      ingredient.ingredient_detail[0].quantity
                    )}
                  </Table.Cell>
                  <Table.Cell className="w-1/4">
                    <div className="flex gap-2">
                      <Button
                        color={
                          editingIngredientId === ingredient.ingredient_id
                            ? "success"
                            : "blue"
                        }
                        onClick={() =>
                          handleEditButtonClick(
                            ingredient.ingredient_id,
                            ingredient.ingredient_detail[0].quantity
                          )
                        }
                      >
                        {editingIngredientId === ingredient.ingredient_id ? (
                          <FaSave />
                        ) : (
                          <FaEdit />
                        )}
                      </Button>

                      <Button
                        color="failure"
                        onClick={() =>
                          openDeleteConfirmation(ingredient.ingredient_id)
                        }
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {quantityErrorMessage && (
            <p className="text-red-500 mt-2">{quantityErrorMessage}</p>
          )}
          <div className="flex justify-end mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          <ConfirmationModal
            show={openDeleteModal}
            onClose={closeDeleteConfirmation}
            onConfirm={deleteSelectedIngredient}
            itemName={getIngredientName()}
          />
        </>
      )}
    </div>
  );
};
export default UpdateIngredientDetail;
