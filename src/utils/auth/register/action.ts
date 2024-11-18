"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signup(
  email: string,
  password: string,
  username: string
) {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    return { error };
  }

  const { data } = await supabase.auth.getUser();

  const insert = await supabase
    .from("user")
    .insert([{ user_id: data.user?.id, role_id: 2, username: username }]);

  revalidatePath("/", "layout");
  redirect("/recipes");
}
