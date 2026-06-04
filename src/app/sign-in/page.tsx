import { type Metadata } from "next";
import SignInClient from "./signin-client";

export const metadata: Metadata = {
  title: "Portal Login | MSNS-LMS | M. S. Naz High School®",
  description: "Secure login to the M. S. Naz High School Learning Management System. Sign in with your credentials to access your dashboard.",
  alternates: {
    canonical: "https://lms.msns.edu.pk/sign-in",
  },
};

export default function SignInPage() {
  return <SignInClient />;
}
