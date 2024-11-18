"use client";

import { Footer } from "flowbite-react";
import { BsGithub, BsInstagram } from "react-icons/bs";

interface UserData {
  user_id: string,
  username: string,
  role_id: number;
}

interface FooterProps {
  user?: UserData | null;
}

export default function NusarasaFooter({user}: FooterProps) {
  if(!user){
    return <div></div>
  }
  
  return (
    <Footer container className="border-t-2">
      <div className="w-full bottom-0 left-0">
        <div className="w-full flex justify-center border-1 border-t-black">
          <Footer.Copyright by="Nusarasa™" year={2024} />
        </div>
      </div>
    </Footer>
  );
}
