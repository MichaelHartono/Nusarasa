"use client";
import { login } from "@/utils/auth/login/action";
import { Button, Label, TextInput } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required!");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email must be a valid email address!");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required!");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("Password must be more than 6 characters!");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (isEmailValid && isPasswordValid) {
      setLoading(true);
      setLoginError("");
      try {
        await login(email, password);
      } catch (error) {
        setLoginError("Login failed, user not found or invalid password!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded-lg border border-gray-300 shadow-md">
        <div className="flex flex-col items-center">
          <Image
            src="https://lcdgpwihlqbcovpwyuur.supabase.co/storage/v1/object/public/image/logo/Nusarasa-logo.png?t=2024-03-28T15%3A25%3A03.260Z"
            alt="Nusarasa Logo"
            width={100}
            height={100}
          />
          <h1 className="text-2xl font-semibold my-2">Nusarasa</h1>
          <h2 className="text-lg font-medium mb-4">Welcome to Nusarasa!</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmailError("");
                setLoginError("");
                setEmail(e.target.value);
              }}
            />
            <span className="text-red-500">{emailError}</span>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Password" />
            </div>
            <TextInput
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPasswordError("");
                setLoginError("");
                setPassword(e.target.value);
              }}
            />
            <span className="text-red-500">{passwordError}</span>
          </div>
          {loginError && (
            <div className="text-red-500 text-center mt-4">{loginError}</div>
          )}
          <div className="flex justify-center">
            <Button type="submit" className="w-1/2">
              {isLoading ? (
                <AiOutlineLoading className="animate-spin" size={18} />
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>

        <div className="flex justify-center items-center mt-4">
          <p className="mr-1">Don&apos;t have an account?</p>
          <Link href="/register" className="underline hover:text-nusa-red">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
