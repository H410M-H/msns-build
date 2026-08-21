import { redirect } from "next/navigation";

export default async function HrEmployeeRedirectPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  redirect(`/admin/users/faculty/${employeeId}/profile`);
}
