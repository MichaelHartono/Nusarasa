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

interface Utensil {
  utensil_id: number;
  utensil_name: string;
}

export default function ManageUtensils() {
  const supabase = createClient();
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [utensilName, setUtensilName] = useState<string | "">("");
  const [error, setError] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentUtensilId, setCurrentUtensilId] = useState<number | null>(null);
  const [currentUtensilName, setCurrentUtensilName] = useState<string>("");
  const [updatedUtensilName, setUpdatedUtensilName] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [existingUtensils, setExistingUtensils] = useState<string[]>([]);

  const [isLoading, setLoading] = useState(false);

  const getUtensils = async () => {
    setLoading(true);
    const { data: utensils } = await supabase
      .from("utensil")
      .select("*")
      .order("utensil_id", { ascending: true });
    setUtensils(utensils || []);
    setLoading(false);
  };

  const getExistingUtensils = () => {
    const utensilName = utensils.map(
      (currentUtensil) => currentUtensil.utensil_name
    );

    setExistingUtensils((prevUtensilNames) => [
      ...prevUtensilNames,
      ...utensilName,
    ]);
  };

  useEffect(() => {
    getUtensils();
  }, []);

  useEffect(() => {
    getExistingUtensils();
  }, [utensils]);

  useEffect(() => {
    if (currentUtensilName) {
      setUpdatedUtensilName(currentUtensilName);
    } else {
      setUpdatedUtensilName("");
    }
  }, [currentUtensilName]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const insertUtensil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utensilName.trim()) {
      setError("Utensil Name is required");
      return;
    }

    const normalizedUtensilName = utensilName.trim().toLowerCase();
    const existingNamesLowerCase = existingUtensils.map((name) =>
      name.toLowerCase()
    );

    if (existingNamesLowerCase.includes(normalizedUtensilName)) {
      setError("Utensil already exists");
      return;
    }

    const { data } = await supabase
      .from("utensil")
      .insert([{ utensil_name: utensilName }]);

    setOpenModal(false);
    getUtensils();
    setError("");
    toast.success("Utensil added successfully!");
  };

  const getUtensilDetailsById = async (utensilId: number) => {
    const { data: utensil } = await supabase
      .from("utensil")
      .select("*")
      .eq("utensil_id", utensilId)
      .single();

    setCurrentUtensilName(utensil.utensil_name);
  };

  const handleEditUtensil = (utensilId: number) => {
    setCurrentUtensilId(utensilId);
    getUtensilDetailsById(utensilId);
    setOpenEditModal(true);
    setUpdateError("");
    setUpdatedUtensilName(currentUtensilName);
  };

  const updateUtensil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatedUtensilName.trim()) {
      setUpdateError("Utensil Name is required");
      return;
    }

    const normalizedUpdatedName = updatedUtensilName.trim().toLowerCase();
    const existingNamesLowerCase = existingUtensils.map((name) =>
      name.toLowerCase()
    );

    if (existingNamesLowerCase.includes(normalizedUpdatedName)) {
      setUpdateError("Utensil already exists");
      return;
    }

    await supabase
      .from("utensil")
      .update({ utensil_name: updatedUtensilName })
      .eq("utensil_id", currentUtensilId);

    setExistingUtensils((prevUtensils) =>
      prevUtensils.map((name) =>
        name === currentUtensilName ? updatedUtensilName : name
      )
    );
    setOpenEditModal(false);
    getUtensils();
    setUpdateError("");
    toast.success("Utensil updated successfully!");
  };

  const deleteUtensil = async (currentUtensilId: number) => {
    await supabase.from("utensil").delete().eq("utensil_id", currentUtensilId);
    getUtensils();
    setOpenDeleteModal(false);
    toast.success("Utensil deleted successfully!");
  };

  const openDeleteConfirmation = (utensilId: number) => {
    setCurrentUtensilId(utensilId);
    getUtensilDetailsById(utensilId);
    setOpenDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteModal(false);
  };

  const [filteredUtensils, setFilteredUtensils] = useState<Utensil[]>([]);

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
    const filtered = utensils?.filter((utensil) =>
      utensil.utensil_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered) {
      setFilteredUtensils(filtered);
    }

    if (currentPage > Math.ceil((filtered?.length || 0) / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [currentPage, searchTerm, utensils, itemsPerPage]);

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <h1 className="text-3xl font-extrabold text-black py-8">
        Manage Utensils
      </h1>
      <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={insertUtensil}>
          <Modal.Header>Add Utensil</Modal.Header>
          <Modal.Body>
            <div className="mb-2 block">
              <Label htmlFor="utensilName" value="Utensil Name" />
            </div>
            <TextInput
              id="UtensilName"
              type="text"
              onChange={(e) => {
                setUtensilName(e.target.value);
                setError("");
              }}
              placeholder="Input utensil name"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <div className="flex gap-2">
              <Button color="failure" onClick={() => {
                  setOpenModal(false);
                  setUtensilName("");
                }}>
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
        <form onSubmit={updateUtensil}>
          <Modal.Header>Update Utensil</Modal.Header>
          <Modal.Body>
            <div className="mb-2 block">
              <Label htmlFor="updatedUtensilName" value="Utensil Name" />
            </div>
            <TextInput
              id="updatedUtensilName"
              type="text"
              value={updatedUtensilName}
              onChange={(e) => {
                setUpdatedUtensilName(e.target.value);
                setUpdateError("");
              }}
              placeholder="Input utensil name"
            />
            {updateError && <p className="text-red-500 mt-2">{updateError}</p>}
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <div className="flex gap-2">
              <Button color="failure" onClick={() => {
                  setOpenEditModal(false);
                  setUpdatedUtensilName("");
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
        onConfirm={() => deleteUtensil(currentUtensilId || 0)}
        itemName={currentUtensilName}
      />
      <div>
        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <TextInput
              rightIcon={IoMdSearch}
              placeholder="Search utensil name"
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
            Utensil
          </Button>
        </div>
        {!isLoading ? (
          <div>
            {filteredUtensils.length === 0 ? (
              <div className="flex justify-center">
                <Alert color="failure" icon={HiInformationCircle}>
                  <span className="font-medium">No Utensils Found!</span>
                </Alert>
              </div>
            ) : (
              <div>
                <Table>
                  <Table.Head>
                    <Table.HeadCell>#</Table.HeadCell>
                    <Table.HeadCell>Utensil name</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {currentUtensils.map((utensil, index) => (
                      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="whitespace-nowrap font-medium text-black w-1">
                          {index + 1 + startIndex}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-black w-1/2">
                          {utensil.utensil_name}
                        </Table.Cell>
                        <Table.Cell className="w-1/4">
                          <div className="flex gap-2">
                            <Button
                              color="blue"
                              onClick={() =>
                                handleEditUtensil(utensil.utensil_id)
                              }
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              color="failure"
                              onClick={() =>
                                openDeleteConfirmation(utensil.utensil_id)
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
