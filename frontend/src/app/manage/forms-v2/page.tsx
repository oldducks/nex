import { redirect } from "next/navigation";

// Legacy test route kept for backward compatibility.
// Canonical route is /manage/forms.
export default function ManageFormsV2RedirectPage() {
  redirect("/manage/forms");
}
