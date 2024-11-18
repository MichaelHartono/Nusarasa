/* eslint-disable react/jsx-key */
"use client";
import ConfirmationModal from "@/components/confirmation-modal";
import DetailModal from "@/components/detail-modal";
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

interface Category {
  category_id: number;
  category_name: string;
}

export default function ManageCategories() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [categoryName, setCategoryName] = useState<string | "">("");
  const [error, setError] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(
    null
  );
  const [currentCategoryName, setCurrentCategoryName] = useState<string>("");
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  const [isLoading, setLoading] = useState(false);

  const getCategories = async () => {
    setLoading(true);
    const { data: categories } = await supabase
      .from("category")
      .select("*")
      .order("category_id", { ascending: true });
    setCategories(categories || []);
    setLoading(false);
  };

  const getExistingCategories = () => {
    const categoryName = categories.map(
      (currentCategory) => currentCategory.category_name
    );

    setExistingCategories((prevCategoryNames) => [
      ...prevCategoryNames,
      ...categoryName,
    ]);
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getExistingCategories();
  }, [categories]);

  useEffect(() => {
    if (currentCategoryName) {
      setUpdatedCategoryName(currentCategoryName);
    } else {
      setUpdatedCategoryName("");
    }
  }, [currentCategoryName]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const insertCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category Name is required");
      return;
    }

    const normalizedCategoryName = categoryName.trim().toLowerCase();
    const existingNamesLowerCase = existingCategories.map((name) =>
      name.toLowerCase()
    );

    if (existingNamesLowerCase.includes(normalizedCategoryName)) {
      setError("Category already exists");
      return;
    }

    const { data } = await supabase
      .from("category")
      .insert([{ category_name: categoryName }]);

    setOpenModal(false);
    getCategories();
    toast.success("Category added successfully!");
  };

  const getCategoryDetailsById = async (categoryId: number) => {
    const { data: category } = await supabase
      .from("category")
      .select("*")
      .eq("category_id", categoryId)
      .single();

    setCurrentCategoryName(category.category_name);
  };

  const handleEditCategory = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    getCategoryDetailsById(categoryId);
    setOpenEditModal(true);
    setUpdateError("");
    setUpdatedCategoryName(currentCategoryName);
  };

  const updateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatedCategoryName.trim()) {
      setUpdateError("Category Name is required");
      return;
    }

    const normalizedUpdatedName = updatedCategoryName.trim().toLowerCase();
    const existingNamesLowerCase = existingCategories.map((name) =>
      name.toLowerCase()
    );

    if (existingNamesLowerCase.includes(normalizedUpdatedName)) {
      setUpdateError("Category already exists");
      return;
    }

    await supabase
      .from("category")
      .update({ category_name: updatedCategoryName })
      .eq("category_id", currentCategoryId);

    setExistingCategories((prevCategories) =>
      prevCategories.map((name) =>
        name === currentCategoryName ? updatedCategoryName : name
      )
    );
    setOpenEditModal(false);
    getCategories();
    toast.success("Category updated successfully!");
  };

  const deleteCategory = async (currentcategoryId: number) => {
    await supabase
      .from("category")
      .delete()
      .eq("category_id", currentCategoryId);
    getCategories();
    setOpenDeleteModal(false);
    toast.success("Category deleted successfully!");
  };

  const openDeleteConfirmation = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    getCategoryDetailsById(categoryId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
  };

  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

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
    const filtered = categories?.filter((category) =>
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered) {
      setFilteredCategories(filtered);
    }

    if (currentPage > Math.ceil((filtered?.length || 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [currentPage, searchTerm, categories, itemsPerPage]);

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold text-black py-8">
        Manage Categories
      </h1>
      <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={insertCategory}>
          <Modal.Header>Add Category</Modal.Header>
          <Modal.Body>
            <div className="mb-2 block">
              <Label htmlFor="categoryName" value="Category Name" />
            </div>
            <TextInput
              id="CategoryName"
              type="text"
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError("");
              }}
              placeholder="Input category name"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <div className="flex gap-2">
              <Button
                color="failure"
                onClick={() => {
                  setOpenModal(false);
                  setCategoryName("");
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
        <form onSubmit={updateCategory}>
          <Modal.Header>Update Category</Modal.Header>
          <Modal.Body>
            <div className="mb-2 block">
              <Label htmlFor="updatedCategoryName" value="Category Name" />
            </div>
            <TextInput
              id="updatedCategoryName"
              type="text"
              value={updatedCategoryName}
              onChange={(e) => {
                setUpdatedCategoryName(e.target.value);
                setUpdateError("");
              }}
              placeholder="Input category Name"
            />
            {updateError && <p className="text-red-500 mt-2">{updateError}</p>}
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <div className="flex gap-2">
              <Button color="failure" onClick={() => {
                  setOpenEditModal(false);
                  setUpdatedCategoryName("");
                }}>
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
        onConfirm={() => deleteCategory(currentCategoryId || 0)}
        itemName={currentCategoryName}
      />
      <div>
        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <TextInput
              rightIcon={IoMdSearch}
              placeholder="Search category name"
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
            Category
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <AiOutlineLoading className="animate-spin" size={100} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex justify-center">
            <Alert color="failure" icon={HiInformationCircle}>
              <span className="font-medium">No Categories Found!</span>
            </Alert>
          </div>
        ) : (
          <div>
            <Table>
              <Table.Head>
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>Category name</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentCategories.map((category, index) => (
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-black w-1">
                      {index + 1 + startIndex}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-black w-1/2">
                      {category.category_name}
                    </Table.Cell>
                    <Table.Cell className="w-1/4">
                      <div className="flex gap-2">
                        <Button
                          color="blue"
                          onClick={() =>
                            handleEditCategory(category.category_id)
                          }
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          color="failure"
                          onClick={() =>
                            openDeleteConfirmation(category.category_id)
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
    </div>
  );
}
