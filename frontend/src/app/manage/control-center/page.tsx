import { redirect } from "next/navigation";

export default function ControlCenterRedirectPage() {
  redirect("/manage/control");
}
