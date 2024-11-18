"use client";
import { Label, TextInput, Button, Alert, Tabs } from "flowbite-react";
import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
  const supabase = createClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState("");
  const [confirmNewPasswordErrorMessage, setConfirmNewPasswordErrorMessage] = useState("");
  const [changeUsernameErrorMessage, setChangeUsernameErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const getUserDetails = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user && user.email) {
        setEmail(user.email);
        const { data: userDetails } = await supabase
          .from("user")
          .select("username")
          .eq("user_id", user.id)
          .single();
        if (userDetails) {
          setUsername(userDetails.username);
        }
      }
    };
    getUserDetails();
  }, [supabase]);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;

    if (newPassword.length === 0) {
      setNewPasswordErrorMessage("New password cannot be empty!");
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordErrorMessage("New password must be at least 8 characters long!");
      hasError = true;
    } else {
      setNewPasswordErrorMessage("");
    }

    if (confirmNewPassword.length === 0) {
      setConfirmNewPasswordErrorMessage("Confirm password cannot be empty!");
      hasError = true;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordErrorMessage("New password and confirm new password do not match!");
      hasError = true;
    } else {
      setConfirmNewPasswordErrorMessage("");
    }

    if (hasError) {
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setNewPasswordErrorMessage(updateError.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    toast.success("Password changed successfully!");
  };

  const validateUsername = async (): Promise<boolean> => {
    if (!newUsername) {
      setChangeUsernameErrorMessage("Username is required!");
      return false;
    }

    if (newUsername.length < 8) {
      setChangeUsernameErrorMessage("Username must be at least 8 characters long!");
      return false;
    }

    const { data: existingUser } = await supabase
      .from("user")
      .select("username")
      .eq("username", newUsername)
      .single();

    if (existingUser) {
      setChangeUsernameErrorMessage("Username is already taken!");
      return false;
    }

    return true;
  };

  const handleChangeUsername = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setChangeUsernameErrorMessage("");

    const isValidUsername = await validateUsername();
    if (!isValidUsername) {
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setChangeUsernameErrorMessage("User not found!");
        return;
      }

      const { error: updateError } = await supabase
        .from("user")
        .update({ username: newUsername })
        .eq("user_id", user.id);

      if (updateError) {
        setChangeUsernameErrorMessage(updateError.message);
        return;
      }

      setUsername(newUsername);
      setNewUsername("");
      toast.success("Username changed successfully!");
    } catch (error) {
      setChangeUsernameErrorMessage("An unexpected error occurred!");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl min-h-screen">
      <h1 className="text-4xl mb-4 font-bold">Manage Account</h1>

      <div className="border-2 border-slate-300 shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="email" value="Email" />
            <div className="mt-2 p-2 border-2 rounded-md">{email}</div>
          </div>
          <div>
            <Label htmlFor="username" value="Username" />
            <div className="mt-2 p-2 border-2 rounded-md">{username}</div>
          </div>
        </div>
      </div>

      <div className="border-2 border-slate-300 rounded-lg shadow-md p-6">
        <Tabs aria-label="Profile Tabs" style="underline">
          <Tabs.Item title="Change Username">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Change Username</h3>
              <div className="mb-4 p-4 border-l-4 border-nusa-red bg-blue-50 rounded">
                <h4 className="font-semibold mb-2">Username Requirements:</h4>
                <ul className="list-disc pl-4">
                  <li>Username should not be empty.</li>
                  <li>Username should be at least 5 characters long.</li>
                  <li>Username should be unique.</li>
                </ul>
              </div>
              <form onSubmit={handleChangeUsername}>
                <div className="mb-4">
                  <Label htmlFor="newUsername" value="New Username" />
                  <TextInput
                    id="newUsername"
                    type="text"
                    placeholder="New Username"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setChangeUsernameErrorMessage("");
                    }}
                    className="mt-2"
                  />
                </div>
                {changeUsernameErrorMessage && (
                  <p className="text-red-500 mb-4">{changeUsernameErrorMessage}</p>
                )}
                <Button type="submit">Change Username</Button>
              </form>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Change Password">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <div className="mb-4 p-4 border-l-4 border-nusa-red bg-blue-50 rounded">
                <h4 className="font-semibold mb-2">Password Requirements:</h4>
                <ul className="list-disc pl-4">
                  <li>New password and confirm new password must match.</li>
                  <li>New password should be at least 8 characters long.</li>
                </ul>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="mb-4">
                  <Label htmlFor="newPassword" value="New Password" />
                  <TextInput
                    id="newPassword"
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setNewPasswordErrorMessage("");
                    }}
                    className="mt-2"
                  />
                  {newPasswordErrorMessage && (
                    <p className="text-red-500 mt-2">{newPasswordErrorMessage}</p>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="confirmNewPassword" value="Confirm New Password" />
                  <TextInput
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setConfirmNewPasswordErrorMessage("");
                    }}
                    className="mt-2"
                  />
                  {confirmNewPasswordErrorMessage && (
                    <p className="text-red-500 mt-2">{confirmNewPasswordErrorMessage}</p>
                  )}
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </div>
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );
}
