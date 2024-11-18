/* eslint-disable react/jsx-key */
"use client";
import ConfirmationModal from "@/components/confirmation-modal";
import { createClient } from "@/utils/supabase/client";
import {
  Alert,
  Button,
  Label,
  Modal,
  Pagination,
  Table,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi";
import { IoMdSearch } from "react-icons/io";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
}

export default function ManageIngredients() {
  const supabase = createClient();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [ingredientName, setIngredientName] = useState<string | "">("");
  const [error, setError] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentIngredientId, setCurrentIngredientId] = useState(0);
  const [currentIngredientName, setCurrentIngredientName] = useState("");
  const [updatedIngredientName, setUpdatedIngredientName] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [existingIngredients, setExistingIngredients] = useState<string[]>([]);

  const [isLoading, setLoading] = useState(false);

  const getIngredients = async () => {
    setLoading(true);
    const { data: ingredients } = await supabase
      .from("ingredient")
      .select("*")
      .order("ingredient_id", { ascending: true });
    setIngredients(ingredients || []);
    setLoading(false);
  };

  const getExistingIngredients = () => {
    const ingredientName = ingredients.map(
      (currentIngredient) => currentIngredient.ingredient_name
    );

    setExistingIngredients((prevIngredientNames) => [
      ...prevIngredientNames,
      ...ingredientName,
    ]);
  };

  useEffect(() => {
    getIngredients();
  }, []);

  useEffect(() => {
    getExistingIngredients();
  }, [ingredients]);

  useEffect(() => {
    if (currentIngredientName) {
      setUpdatedIngredientName(currentIngredientName);
    } else {
      setUpdatedIngredientName("");
    }
  }, [currentIngredientName]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const insertIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientName.trim()) {
      setError("Ingredient Name is required");
      return;
    }

    const normalizedIngredientName = ingredientName.trim().toLowerCase();
    const existingNamesLowerCase = existingIngredients.map((name) =>
      name.toLowerCase()
    );

    if (existingNamesLowerCase.includes(normalizedIngredientName)) {
      setError("Ingredient already exists");
      return;
    }

    const { data } = await supabase
      .from("ingredient")
      .insert([{ ingredient_name: ingredientName }]);

    setOpenModal(false);
    getIngredients();
    setError("");

    toast.success("Ingredient added successfully!");
  };

  const getIngredientDetailsById = async (ingredientId: number) => {
    const { data: ingredient } = await supabase
      .from("ingredient")
      .select("*")
      .eq("ingredient_id", ingredientId)
      .single();

    setCurrentIngredientName(ingredient.ingredient_name);
  };

  const handleEditIngredient = (ingredientId: number) => {
    setCurrentIngredientId(ingredientId);
    getIngredientDetailsById(ingredientId);
    setOpenEditModal(true);
    setUpdateError("");
    setUpdatedIngredientName(currentIngredientName);
  };

  const updateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatedIngredientName.trim()) {
      setUpdateError("Ingredient Name is required");
      return;
    }

    const normalizedUpdatedName = updatedIngredientName.trim().toLowerCase();
    const existingNamesLowerCase = existingIngredients.map((name) =>
      name.toLowerCase()
    );

    if (existingNamesLowerCase.includes(normalizedUpdatedName)) {
      setUpdateError("Ingredient already exists");
      return;
    }

    await supabase
      .from("ingredient")
      .update({ ingredient_name: updatedIngredientName })
      .eq("ingredient_id", currentIngredientId);

    setExistingIngredients((prevIngredients) =>
      prevIngredients.map((name) =>
        name.toLowerCase() === currentIngredientName.toLowerCase()
          ? updatedIngredientName
          : name
      )
    );
    setOpenEditModal(false);
    getIngredients();
    setUpdateError("");
    toast.success("Ingredient updated successfully!");
  };

  const deleteIngredient = async (currentIngredientId: number) => {
    await supabase
      .from("ingredient")
      .delete()
      .eq("ingredient_id", currentIngredientId);
    getIngredients();
    setOpenDeleteModal(false);
    toast.success("Ingredient deleted successfully!");
  };

  const openDeleteConfirmation = (ingredientId: number) => {
    setCurrentIngredientId(ingredientId);
    getIngredientDetailsById(ingredientId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
  };

  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentIngredients = filteredIngredients.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const filtered = ingredients?.filter((ingredient) =>
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
  }, [ingredients, searchTerm, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold text-black py-8">
        Manage Ingredients
      </h1>
      <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={insertIngredient}>
          <Modal.Header>Add Ingredient</Modal.Header>
          <Modal.Body>
            <div className="mb-2 block">
              <Label htmlFor="ingredientName" value="Ingredient Name" />
            </div>
            <TextInput
              id="IngredientName"
              type="text"
              onChange={(e) => {
                setIngredientName(e.target.value);
                setError("");
              }}
              placeholder="Input ingredient name"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <div className="flex gap-2">
              <Button
                color="failure"
                onClick={() => {
                  setOpenModal(false);
                  setIngredientName("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="success">
                Add
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
      <Modal
        dismissible
        show={openEditModal}
        onClose={() => setOpenEditModal(false)}
      >
        <form onSubmit={updateIngredient}>
          <Modal.Header>Update Ingredient</Modal.Header>
          <Modal.Body>
            <div className="mb-2 block">
              <Label htmlFor="updatedIngredientName" value="Ingredient Name" />
            </div>
            <TextInput
              id="updatedIngredientName"
              type="text"
              value={updatedIngredientName}
              onChange={(e) => {
                setUpdatedIngredientName(e.target.value);
                setUpdateError("");
              }}
              placeholder="Input ingredient name"
            />
            {updateError && <p className="text-red-500 mt-2">{updateError}</p>}
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <div className="flex gap-2">
              <Button
                color="failure"
                onClick={() => {
                  setOpenEditModal(false);
                  setUpdatedIngredientName("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" color="success">
                Update
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
      <ConfirmationModal
        show={openDeleteModal}
        onClose={closeDeleteConfirmation}
        onConfirm={() => deleteIngredient(currentIngredientId || 0)}
        itemName={currentIngredientName}
      />
      <div>
        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <TextInput
              rightIcon={IoMdSearch}
              placeholder="Search ingredient name"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            color="success"
            onClick={() => {
              setOpenModal(true);
              setError("");
            }}
          >
            <FaPlus className="mr-2 h-5 w-5" />
            Ingredient
          </Button>
        </div>
        {!isLoading ? (
          <div>
            {filteredIngredients.length === 0 ? (
              <div className="flex justify-center">
                <Alert color="failure" icon={HiInformationCircle}>
                  <span className="font-medium">No Ingredients Found!</span>
                </Alert>
              </div>
            ) : (
              <div>
                <Table>
                  <Table.Head>
                    <Table.HeadCell>#</Table.HeadCell>
                    <Table.HeadCell>Ingredient name</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {currentIngredients.map((ingredient, index) => (
                      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="whitespace-nowrap font-medium text-black w-1">
                          {index + 1 + startIndex}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-black w-1/2">
                          {ingredient.ingredient_name}
                        </Table.Cell>
                        <Table.Cell className="w-1/4">
                          <div className="flex gap-2">
                            <Button
                              color="blue"
                              onClick={() =>
                                handleEditIngredient(ingredient.ingredient_id)
                              }
                            >
                              <FaEdit />
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
                <div className="flex justify-end mt-4">
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
    </div>
  );
}
