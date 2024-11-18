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
import { FaPlus, FaTrash } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { HiInformationCircle } from "react-icons/hi";
import CategoryTable from "./category-table";
import ConfirmationModal from "./confirmation-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UpdateCategoryDetailProps {
  recipeId: number;
}

interface RecipeCategoryDetail {
  category_id: number;
  category_name: string;
}

interface CategoryDetails {
  recipe_id: number;
  category_id: number;
}

const UpdateCategoryDetail: React.FC<UpdateCategoryDetailProps> = ({
  recipeId,
}) => {
  const supabase = createClient();
  const [recipeCategoryDetails, setRecipeCategoryDetails] = useState<
    RecipeCategoryDetail[]
  >([]);
  const [categories, setCategories] = useState<RecipeCategoryDetail[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetails[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null
  );

  const getRecipeCategoryDetails = async () => {
    const { data, error } = await supabase
      .from("category")
      .select(`*, category_detail:category_id!inner(recipe_id)`)
      .eq(`category_detail.recipe_id`, recipeId);

    setRecipeCategoryDetails(data || []);
  };

  const getFilteredCategories = async () => {
    const { data, error } = await supabase.from("category").select("*");

    if (data) {
      const existingCategoryIds = new Set(
        recipeCategoryDetails.map((detail) => detail.category_id)
      );

      const nonRecipeCategories = data.filter(
        (category) => !existingCategoryIds.has(category.category_id)
      );

      setCategories(nonRecipeCategories);
    }
  };

  useEffect(() => {
    getRecipeCategoryDetails();
  }, []);

  useEffect(() => {
    getFilteredCategories();
  }, [recipeCategoryDetails]);

  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string>("");

  const insertCategoryDetails = async () => {
    if (categoryDetails.length === 0) {
      setCategoryErrorMessage("No categories have been added.");
      return;
    }

    const { error } = await supabase
      .from("category_detail")
      .insert(categoryDetails);

    if (error) {
      setCategoryErrorMessage(
        "Error inserting category details. Please try again."
      );
      return;
    }

    setCategoryErrorMessage("");
    setOpenModal(false);
    setCategoryDetails([]);
    getRecipeCategoryDetails();

    toast.success("Recipe category(s) updated successfully!");
  };

  const deleteCategoryDetail = async (categoryId: number) => {
    await supabase
      .from("category_detail")
      .delete()
      .eq("category_id", categoryId)
      .eq("recipe_id", recipeId);

    getRecipeCategoryDetails();
    setOpenDeleteModal(false);
    toast.success("Recipe category(s) deleted successfully!");
  };

  const openDeleteConfirmation = (categoryId: number) => {
    setDeletingCategoryId(categoryId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
    setDeletingCategoryId(null);
  };

  const deleteSelectedCategory = () => {
    if (deletingCategoryId !== null) {
      deleteCategoryDetail(deletingCategoryId);
    }
  };

  const getCategoryName = () => {
    if (deletingCategoryId === null) {
      return "";
    }

    const category = recipeCategoryDetails.find(
      (detail) => detail.category_id === deletingCategoryId
    );

    return category?.category_name || "";
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<
    RecipeCategoryDetail[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentCategories = filteredCategories.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const filtered = recipeCategoryDetails?.filter((category) =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered) {
      setFilteredCategories(filtered);
    }

    if (currentPage > Math.ceil((filtered?.length | 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [recipeCategoryDetails, searchTerm, currentPage, itemsPerPage]);

  return (
    <div>
      <div className="flex justify-between mb-8">
        <div className="w-1/2">
          <TextInput
            rightIcon={IoMdSearch}
            placeholder="Search Category Name"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button color="success" onClick={() => setOpenModal(true)}>
          <FaPlus className="mr-2 h-5 w-5" />
          Category
        </Button>
        <Modal
          dismissible
          show={openModal}
          onClose={() => setOpenModal(false)}
          size="6xl"
        >
          <Modal.Header>Add Recipe Category</Modal.Header>
          <Modal.Body>
            <CategoryTable
              categories={categories}
              categoryDetails={categoryDetails}
              setCategoryDetails={setCategoryDetails}
              recipeId={recipeId}
            />
          </Modal.Body>
          <Modal.Footer className="justify-between items-center">
            {categoryErrorMessage ? (
              <p className="text-red-500">{categoryErrorMessage}</p>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button color="failure" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button color="success" onClick={insertCategoryDetails}>
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="flex justify-center">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="font-medium">No Categories Found!</span>
          </Alert>
        </div>
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.HeadCell>Category Name</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentCategories.map((category) => (
                <Table.Row>
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    {category.category_name}
                  </Table.Cell>
                  <Table.Cell className="w-1/4">
                    <Button
                      color="failure"
                      onClick={() =>
                        openDeleteConfirmation(category.category_id)
                      }
                    >
                      <FaTrash />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <ConfirmationModal
            show={openDeleteModal}
            onClose={closeDeleteConfirmation}
            onConfirm={deleteSelectedCategory}
            itemName={getCategoryName()}
          />
        </>
      )}
    </div>
  );
};

export default UpdateCategoryDetail;
