import React, { useEffect, useState } from "react";
import { Checkbox, Pagination, Table, TextInput, Alert } from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { HiInformationCircle } from "react-icons/hi";

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
}

interface IngredientDetails {
  recipe_id: number;
  ingredient_id: number;
  quantity: string;
}

interface DetailTableProps {
  ingredients?: Ingredient[];
  ingredientDetails: IngredientDetails[];
  setIngredientDetails: React.Dispatch<
    React.SetStateAction<IngredientDetails[]>
  >;
  recipeId: number;
}

const IngredientTable: React.FC<DetailTableProps> = ({
  ingredients = [],
  ingredientDetails,
  setIngredientDetails,
  recipeId,
}) => {
  const [searchIngredient, setSearchIngredient] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.ingredient_name
      .toLowerCase()
      .includes(searchIngredient.toLowerCase())
  );

  const sortedIngredients = filteredIngredients.sort((a, b) => {
    const aChecked = ingredientDetails.some(
      (item) => item.ingredient_id === a.ingredient_id
    );
    const bChecked = ingredientDetails.some(
      (item) => item.ingredient_id === b.ingredient_id
    );

    if (aChecked && !bChecked) {
      return -1;
    } else if (!aChecked && bChecked) {
      return 1;
    } else {
      return 0;
    }
  });

  const currentIngredients = sortedIngredients.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleIngredientCheckboxChange = (
    ingredient_id: number,
    checked: boolean
  ) => {
    if (checked) {
      setIngredientDetails((prevState) => [
        ...prevState,
        { recipe_id: recipeId, ingredient_id, quantity: "" },
      ]);
    } else {
      setIngredientDetails((prevState) =>
        prevState.filter((item) => item.ingredient_id !== ingredient_id)
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchIngredient(e.target.value);
    setCurrentPage(1);
  };

  const handleQuantityChange = (ingredient_id: number, quantity: string) => {
    setIngredientDetails((prevState) =>
      prevState.map((item) =>
        item.ingredient_id === ingredient_id ? { ...item, quantity } : item
      )
    );
  };

  return (
    <div className="border border-slate-300 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-black">Ingredients</h2>
        <TextInput
          rightIcon={IoMdSearch}
          placeholder="Search ingredient"
          onChange={handleSearchChange}
        />
      </div>

      {filteredIngredients.length === 0 ? (
        <div className="flex justify-center">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="font-medium">No Ingredients Found!</span>
          </Alert>
        </div>
      ) : (
        <>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">Select</Table.HeadCell>
              <Table.HeadCell>Ingredient</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentIngredients.map((ingredient) => {
                const ingredientDetail = ingredientDetails.find(
                  (item) => item.ingredient_id === ingredient.ingredient_id
                );
                const isChecked = !!ingredientDetail;
                return (
                  <Table.Row
                    key={ingredient.ingredient_id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="p-4 w-1/4">
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) =>
                          handleIngredientCheckboxChange(
                            ingredient.ingredient_id,
                            e.target.checked
                          )
                        }
                      />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-black">
                      {ingredient.ingredient_name}
                    </Table.Cell>
                    <Table.Cell>
                      <TextInput
                        type="text"
                        placeholder="Quantity"
                        value={ingredientDetail?.quantity || ""}
                        onChange={(e) =>
                          handleQuantityChange(
                            ingredient.ingredient_id,
                            e.target.value
                          )
                        }
                        disabled={!isChecked}
                      />
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

export default IngredientTable;
