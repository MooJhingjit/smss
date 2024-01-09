'use server';
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache";
import { z } from "zod"

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export async function create(formData: FormData) {

  const { name, email } = CreateUserSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  await db.user.create({
    data: {
      name,
      email
    },
  })

  // revalidatePath('/users')
}