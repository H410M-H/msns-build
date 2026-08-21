import { redirect } from "next/navigation";

export default function HrEmployeesIndexPage() {
  redirect("/admin/users/faculty/view");
}
