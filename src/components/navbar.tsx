"use client";
import { Dropdown, Navbar } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { usePathname } from "next/navigation";
import { logout } from "@/utils/auth/logout/action";
import { RiArrowDropDownLine } from "react-icons/ri";

interface UserData {
  user_id: string;
  username: string;
  role_id: number;
}

interface NavbarProps {
  user?: UserData | null;
}

export default function NusarasaNavbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return <div></div>;
  }

  return (
    <Navbar fluid rounded className="shadow-md py-3 px-4 md:px-6">
      <Navbar.Brand>
        <Image
          src="https://lcdgpwihlqbcovpwyuur.supabase.co/storage/v1/object/public/image/logo/Nusarasa-logo.png?t=2024-03-28T15%3A25%3A03.260Z"
          alt="Nusarasa Logo"
          className="mr-3"
          width={60}
          height={60}
        />
        <span className="self-center text-xl font-semibold whitespace-nowrap text-black">
          NUSARASA
        </span>
      </Navbar.Brand>
      <div className="flex items-center md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={<CgProfile className="size-10" />}
          className="text-sm"
        >
          <Dropdown.Item as={Link} href="/profile">
            Manage Account
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link
          href="/recipes"
          as={Link}
          active={pathname === "/recipes" ? true : false}
          className="mr-4 md:mr-6 text-black"
        >
          Recipes
        </Navbar.Link>
        <Navbar.Link
          href="/favorites"
          as={Link}
          className="mr-4 md:mr-6 text-black"
          active={pathname === "/favorites" ? true : false}
        >
          Favorite
        </Navbar.Link>
        <Navbar.Link
          href="/chatbot"
          as={Link}
          className="mr-4 md:mr-6 text-black"
          active={pathname === "/chatbot" ? true : false}
        >
          Chatbot
        </Navbar.Link>
        {user?.role_id === 1 && (
          <Navbar.Link
            href="/manage-recipe"
            as={Link}
            active={pathname === "/manage-recipe" ? true : false}
            className="text-black mr-4 md:mr-6"
          >
            Manage Recipes
          </Navbar.Link>
        )}

        {user?.role_id === 1 && (
            <Dropdown
              label=""
              dismissOnClick
              renderTrigger={() => (
                <div className="flex items-center max-[760px]:py-2 max-[760px]:pl-3 max-[760px]:pr-4">
                  <p className="hover:text-nusa-red pb-1 text-black cursor-pointer">
                    Manage Details
                  </p>
                  <RiArrowDropDownLine size={24} className="pb-1" />
                </div>
              )}
            >
              <Dropdown.Item as={Link} href="/manage-details/ingredients">
                Manage Ingredients
              </Dropdown.Item>
              <Dropdown.Item as={Link} href="/manage-details/utensils">
                Manage Utensils
              </Dropdown.Item>
              <Dropdown.Item as={Link} href="/manage-details/categories">
                Manage Categories
              </Dropdown.Item>
            </Dropdown>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
