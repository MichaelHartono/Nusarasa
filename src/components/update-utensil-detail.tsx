/* eslint-disable react/jsx-key */
"use client";

import { createClient } from "@/utils/supabase/client";
import {
  Alert,
  Button,
  Modal,
  Pagination,
  Table,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import UtensilTable from "./utensil-table";
import ConfirmationModal from "./confirmation-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiInformationCircle } from "react-icons/hi";

interface UpdateUtensilDetailProps {
  recipeId: number;
}

interface RecipeUtensilDetail {
  utensil_id: number;
  utensil_name: string;
}

interface UtensilDetails {
  recipe_id: number;
  utensil_id: number;
}

const UpdateUtensilDetail: React.FC<UpdateUtensilDetailProps> = ({
  recipeId,
}) => {
  const supabase = createClient();
  const [recipeUtensilDetails, setRecipeUtensilDetails] = useState<
    RecipeUtensilDetail[]
  >([]);
  const [utensils, setUtensils] = useState<RecipeUtensilDetail[]>([]);
  const [utensilDetails, setUtensilDetails] = useState<UtensilDetails[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingUtensilId, setDeletingUtensilId] = useState<number | null>(
    null
  );

  const getRecipeUtensiltDetails = async () => {
    const { data, error } = await supabase
      .from("utensil")
      .select(`*, utensil_detail:utensil_id!inner(recipe_id)`)
      .eq(`utensil_detail.recipe_id`, recipeId);

    setRecipeUtensilDetails(data || []);
  };

  const getFilteredUtensils = async () => {
    const { data, error } = await supabase.from("utensil").select("*");

    if (data) {
      const existingUtensilIds = new Set(
        recipeUtensilDetails.map((detail) => detail.utensil_id)
      );

      const nonRecipeUtensils = data.filter(
        (utensil) => !existingUtensilIds.has(utensil.utensil_id)
      );

      setUtensils(nonRecipeUtensils);
    }
  };

  useEffect(() => {
    getRecipeUtensiltDetails();
  }, []);

  useEffect(() => {
    getFilteredUtensils();
  }, [recipeUtensilDetails]);

  const [utensilErrorMessage, setUtensilErrorMessage] = useState<string>("");

  const insertUtensilDetails = async () => {
    if (utensilDetails.length === 0) {
      setUtensilErrorMessage("No utensils have been added.");
      return;
    }

    const { error } = await supabase
      .from("utensil_detail")
      .insert(utensilDetails);

    if (error) {
      setUtensilErrorMessage(
        "Error inserting utensil details. Please try again."
      );
      return;
    }

    setUtensilErrorMessage("");
    setOpenModal(false);
    setUtensilDetails([]);
    getRecipeUtensiltDetails();

    toast.success("Recipe utensil(s) updated successfully!");
  };

  const deleteUtensilDetail = async (UtensilId: number) => {
    await supabase
      .from("utensil_detail")
      .delete()
      .eq("utensil_id", UtensilId)
      .eq("recipe_id", recipeId);

    getRecipeUtensiltDetails();
    setOpenDeleteModal(false);

    toast.success("Recipe utensil(s) deleted successfully!");
  };

  const openDeleteConfirmation = (UtensilId: number) => {
    setDeletingUtensilId(UtensilId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
    setDeletingUtensilId(null);
  };

  const deleteSelectedUtensil = () => {
    if (deletingUtensilId !== null) {
      deleteUtensilDetail(deletingUtensilId);
    }
  };

  const getUtensilName = () => {
    if (deletingUtensilId === null) {
      return "";
    }

    const utensil = recipeUtensilDetails.find(
      (detail) => detail.utensil_id === deletingUtensilId
    );

    return utensil?.utensil_name || "";
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUtensils, setFilteredUtensils] = useState<
    RecipeUtensilDetail[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentUtensils = filteredUtensils.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUtensils.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const filtered = recipeUtensilDetails?.filter((utensil) =>
      utensil.utensil_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered) {
      setFilteredUtensils(filtered);
    }

    if (currentPage > Math.ceil((filtered?.length || 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [recipeUtensilDetails, searchTerm, currentPage, itemsPerPage]);

  return (
    <div>
      <div className="flex justify-between mb-8">
        <div className="w-1/2">
          <TextInput
            rightIcon={IoMdSearch}
            placeholder="Search Utensil name"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button color="success" onClick={() => setOpenModal(true)}>
          <FaPlus className="mr-2 h-5 w-5" />
          Utensil
        </Button>
        <Modal
          dismissible
          show={openModal}
          onClose={() => setOpenModal(false)}
          size="6xl"
        >
          <Modal.Header>Add Recipe Utensil</Modal.Header>
          <Modal.Body>
            <UtensilTable
              utensils={utensils}
              utensilDetails={utensilDetails}
              setUtensilDetails={setUtensilDetails}
              recipeId={recipeId}
            />
          </Modal.Body>
          <Modal.Footer className="justify-between items-center">
            {utensilErrorMessage ? (
              <p className="text-red-500">{utensilErrorMessage}</p>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button color="failure" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button color="success" onClick={insertUtensilDetails}>
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
      {filteredUtensils.length === 0 ? (
        <div className="flex justify-center">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="font-medium">No Utensils Found!</span>
          </Alert>
        </div>
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.HeadCell>Utensil name</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentUtensils.map((utensil) => (
                <Table.Row>
                  <Table.Cell className="whitespace-nowrap font-medium text-black">
                    {utensil.utensil_name}
                  </Table.Cell>
                  <Table.Cell className="w-1/4">
                    <Button
                      color="failure"
                      onClick={() => openDeleteConfirmation(utensil.utensil_id)}
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
            onConfirm={deleteSelectedUtensil}
            itemName={getUtensilName()}
          />
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
  );
};

export default UpdateUtensilDetail;
