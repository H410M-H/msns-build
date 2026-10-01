import { type Metadata } from "next";
import SignInClient from "./signin-client";

export const metadata: Metadata = {
  title: "Portal Login | Student, Parent & Teacher Sign In",
  description: "Secure login to the M. S. Naz High School LMS portal. Access real-time attendance, daily homework diaries, marks sheets, and online fee challan tracking.",
  alternates: {
    canonical: "https://lms.msns.edu.pk/sign-in",
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function SignInPage() {
  return <SignInClient />;
}
