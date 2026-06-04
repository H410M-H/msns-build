import { type Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "MSNS-LMS - Pursuit of Excellence | M. S. Naz High School®",
  description: "Welcome to the Next-Gen Learning Management System for M. S. Naz High School. Access role-specific dashboards, assignments, fees, grades, and school management tools.",
  alternates: {
    canonical: "https://lms.msns.edu.pk",
  },
};

export default function Home() {
  return <HomeClient />;
}
