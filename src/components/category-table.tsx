"use client";
import React, { useState } from "react";
import { Checkbox, Pagination, Table, TextInput, Alert } from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { HiInformationCircle } from "react-icons/hi";

interface Category {
  category_id: number;
  category_name: string;
}

interface CategoryDetails {
  recipe_id: number;
  category_id: number;
}

interface CategoryTableProps {
  categories: Category[];
  categoryDetails: CategoryDetails[];
  setCategoryDetails: React.Dispatch<React.SetStateAction<CategoryDetails[]>>;
  recipeId: number;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  categoryDetails,
  setCategoryDetails,
  recipeId,
}) => {
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCategories = categories.filter((category) =>
    category.category_name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const sortedCategories = filteredCategories.sort((a, b) => {
    const aDetail = categoryDetails.some(
      (item) => item.category_id === a.category_id
    );
    const bDetail = categoryDetails.some(
      (item) => item.category_id === b.category_id
    );

    if (aDetail && !bDetail) {
      return -1;
    } else if (!aDetail && bDetail) {
      return 1;
    }
    return 0;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = sortedCategories.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryCheckboxChange = (
    category_id: number,
    checked: boolean
  ) => {
    if (checked) {
      setCategoryDetails((prevState) => [
        ...prevState,
        { recipe_id: recipeId, category_id },
      ]);
    } else {
      setCategoryDetails((prevState) =>
        prevState.filter((item) => item.category_id !== category_id)
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="border border-slate-300 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-black mb-2">Categories</h2>
        <TextInput
          placeholder="Search Category"
          onChange={handleSearchChange}
          rightIcon={IoMdSearch}
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="flex justify-center">
          <Alert color="failure" icon={HiInformationCircle}>
            <span className="font-medium">No Categories Found!</span>
          </Alert>
        </div>
      ) : (
        <>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-4">Select</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {currentCategories.map((category) => {
                const isChecked = categoryDetails.some(
                  (item) => item.category_id === category.category_id
                );
                return (
                  <Table.Row key={category.category_id} className="bg-white">
                    <Table.Cell className="p-4 w-1/4">
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) =>
                          handleCategoryCheckboxChange(
                            category.category_id,
                            e.target.checked
                          )
                        }
                      />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-black">
                      {category.category_name}
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

export default CategoryTable;
