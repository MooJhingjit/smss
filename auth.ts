import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { User } from "@prisma/client";
import bcrypt from 'bcrypt';
import { db } from './lib/db';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    return user ?? undefined;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const getUserById = async (id: number) => {
  try {
      const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};


export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials): Promise<any> {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password as string);
          // const passwordsMatch = password === user.password;
          if (passwordsMatch) return user;
        }
      },
    }),
  ],
});