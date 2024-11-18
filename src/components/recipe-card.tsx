"use client";
import { Badge, Button, Card } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HiClock, HiOutlineArrowRight } from "react-icons/hi";
import { IoTimeOutline } from "react-icons/io5";

interface RecipeCardProps {
  recipe_id: number;
  recipe_name: string;
  recipe_desc: string;
  image_url: string;
  cooking_time: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe_id,
  recipe_name,
  recipe_desc,
  image_url,
  cooking_time,
}) => {
  return (
    <div className="container mx-auto grid grid-cols-1 relative bg-white shadow-lg hover:shadow-xl rounded-lg transition-shadow duration-300 overflow-hidden">
      <div className="col-span-1 flex flex-col bg-white">
        <div className="relative w-full h-60">
          <Image
            className="object-cover w-full h-full rounded-t-lg"
            src={image_url}
            alt={recipe_name}
            layout="fill"
          />
        </div>
        <h5 className="text-2xl m-4 font-bold text-nowrap text-gray-900">
          {recipe_name}
        </h5>
        <p className="text-md mx-4 mb-2 text-justify ">{recipe_desc}</p>
        <div className="flex justify-between mt-auto pt-3 mx-4 mb-4">
          <Badge color="gray" size="lg" icon={HiClock}>
            <span className="me-1">{cooking_time} minutes</span>
          </Badge>
          <Button as={Link} href={`/recipes/${recipe_id}`}>
            Details
            <HiOutlineArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
