import React, { useState } from "react";
import { Checkbox, Pagination, Table, TextInput, Alert } from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { HiInformationCircle } from "react-icons/hi";

interface Utensil {
  utensil_id: number;
  utensil_name: string;
}

interface UtensilDetails {
  recipe_id: number;
  utensil_id: number;
}

interface UtensilTableProps {
  utensils?: Utensil[];
  utensilDetails: UtensilDetails[];
  setUtensilDetails: React.Dispatch<React.SetStateAction<UtensilDetails[]>>;
  recipeId: number;
}

const UtensilTable: React.FC<UtensilTableProps> = ({
  utensils = [],
  utensilDetails,
  setUtensilDetails,
  recipeId,
}) => {
  const [checkedUtensilIds, setCheckedUtensilIds] = useState<number[]>([]);
  const [searchUtensil, setSearchUtensil] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const handleUtensilCheckboxChange = (
    utensil_id: number,
    checked: boolean
  ) => {
    if (checked) {
      setCheckedUtensilIds((prevState) => [utensil_id, ...prevState]);
      setUtensilDetails((prevState) => [
        ...prevState,
        { recipe_id: recipeId, utensil_id },
      ]);
    } else {
      setCheckedUtensilIds((prevState) =>
        prevState.filter((id) => id !== utensil_id)
      );
      setUtensilDetails((prevState) =>
        prevState.filter((item) => item.utensil_id !== utensil_id)
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUtensil(e.target.value);
    setCurrentPage(1);
  };

  const filteredUtensils = utensils.filter((utensil) =>
    utensil.utensil_name.toLowerCase().includes(searchUtensil.toLowerCase())
  );

  const sortedUtensils = filteredUtensils.sort((a, b) => {
    const aChecked = checkedUtensilIds.includes(a.utensil_id);
    const bChecked = checkedUtensilIds.includes(b.utensil_id);

    if (aChecked && !bChecked) {
      return -1;
    } else if (!aChecked && bChecked) {
      return 1;
    } else {
      return 0;
    }
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUtensils = sortedUtensils.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(sortedUtensils.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="border border-slate-300 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-black mb-2">Utensils</h2>
        <TextInput
          rightIcon={IoMdSearch}
          placeholder="Search Utensil"
          value={searchUtensil}
          onChange={handleSearchChange}
        />
      </div>

      {filteredUtensils.length === 0 ? (
        <div className="flex justify-center">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="font-medium">No Utensils Found!</span>
          </Alert>
        </div>
      ) : (
        <>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">Select</Table.HeadCell>
              <Table.HeadCell>Utensil</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentUtensils.map((utensil) => {
                const isChecked = utensilDetails.some(
                  (item) => item.utensil_id === utensil.utensil_id
                );

                return (
                  <Table.Row
                    key={utensil.utensil_id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="p-4 w-1/4">
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) =>
                          handleUtensilCheckboxChange(
                            utensil.utensil_id,
                            e.target.checked
                          )
                        }
                      />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-black">
                      {utensil.utensil_name}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
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
  );
};

export default UtensilTable;
