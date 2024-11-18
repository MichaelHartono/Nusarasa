import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import NusarasaNavbar from "@/components/navbar";
import NusarasaFooter from "@/components/footer";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { ToastContainer } from "react-toastify";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Nusarasa",
  description: "Recipe Book Web App with Chatbot",
  icons: {
    icon: "https://lcdgpwihlqbcovpwyuur.supabase.co/storage/v1/object/public/image/logo/Nusarasa-logo.png?t=2024-03-28T15%3A25%3A03.260Z"
  }
};

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

interface ILayoutProps {
  children: React.ReactNode;
}

async function getUserSession() {
  const supabase = createClient();

  const { data: userResponse } = await supabase.auth.getUser();
  const user = userResponse?.user;

  if (!user) {
    return null;
  }

  const { data: userData, error: userDataError } = await supabase
    .from("user")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (userDataError) {
    throw new Error("Error getting user data");
  }

  return userData;
}

export default async function Layout({ children }: ILayoutProps) {
  const userData = await getUserSession();

  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <div className="flex flex-col min-h-screen">
          <NusarasaNavbar user={userData} />
          <ToastContainer autoClose={2000} />
          <div className="flex-grow px-2 py-4">{children}</div>
          <NusarasaFooter user={userData} />
        </div>
      </body>
    </html>
  );
}
