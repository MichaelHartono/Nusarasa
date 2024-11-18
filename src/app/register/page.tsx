"use client";
import { signup } from "@/utils/auth/register/action";
import { Button, Label, TextInput } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
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

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password is required!");
      return false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError("Password and confirm password do not match!");
      return false;
    }

    setConfirmPasswordError("");
    return true;
  };

  const validateUsername = () => {
    if (!username) {
      setUsernameError("Username is required!");
      return false;
    }

    if (username.length < 8) {
      setUsernameError("Username must be more than 8 characters!");
      return false;
    }

    setUsernameError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isUsernameValid = validateUsername();
    if (
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid &&
      isUsernameValid
    ) {
      setLoading(true);
      setRegisterError("");
      try {
        await signup(email, password, username);
      } catch (error) {
        setRegisterError("Register failed, email already used!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError("");
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
          <h2 className="text-lg font-medium mb-4">Register to Nusarasa</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="username" value="Username" />
            </div>
            <TextInput
              id="username"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
            />
            <span className="text-red-500">{usernameError}</span>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput
              id="email"
              placeholder="youremail@email.com"
              value={email}
              onChange={handleEmailChange}
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
              onChange={handlePasswordChange}
            />
            <span className="text-red-500">{passwordError}</span>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value="Confirm Password" />
            </div>
            <TextInput
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            <span className="text-red-500">{confirmPasswordError}</span>
          </div>
          {registerError && (
            <div className="text-red-500 text-center mt-4">{registerError}</div>
          )}
          <div className="flex justify-center">
            <Button type="submit" className="w-1/2">
              {isLoading ? (
                <AiOutlineLoading className="animate-spin" size={18} />
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
        <div className="flex justify-center items-center mt-4">
          <p className="mr-1">Already have an account?</p>
          <Link href="/login" className="underline hover:text-nusa-red">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
