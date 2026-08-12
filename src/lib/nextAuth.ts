import { comparePassword, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { NextAuthOptions } from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const appleEnabled = Boolean(process.env.APPLE_ID && process.env.APPLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          }),
        ]
      : []),
    ...(appleEnabled
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID || '',
            clientSecret: process.env.APPLE_CLIENT_SECRET || '',
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            password: true,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          image: user.avatar || null,
        };
      },
    }),
  ],
  pages: {
    signIn: '/en/auth/login',
  },
  callbacks: {
    async signIn({ account, user }) {
      if ((account?.provider === 'google' || account?.provider === 'apple') && user.email) {
        const email = user.email.toLowerCase();
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
          const fallbackName = account?.provider === 'apple' ? 'Apple User' : 'Google User';
          await prisma.user.create({
            data: {
              email,
              password: await hashPassword(`${Date.now()}-${Math.random().toString(36).slice(2)}`),
              name: user.name || fallbackName,
              avatar: user.image || null,
              verified: true,
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email || token.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId ?? (session.user as any).id;
      }

      return session;
    },
  },
};
