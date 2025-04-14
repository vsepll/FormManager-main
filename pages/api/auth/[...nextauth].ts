import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Session } from "next-auth";
// Move credentials to environment variables in production
const VALID_USERS = [
  {
    id: "1",
    email: "admin@autoentrada.com",
    password: "admin123", // Use env in production
    name: "Admin",
    role: "admin"
  },
  {
    id: "2",
    email: "user@autoentrada.com",
    password: "user123", // Use env in production
    name: "User",
    role: "user"
  }
]

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        const user = VALID_USERS.find(user => 
          user.email === credentials.email && 
          user.password === credentials.password
        )

        if (!user) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key" // Use env in production
})