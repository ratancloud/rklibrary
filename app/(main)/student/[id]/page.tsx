import StudentProfileClient from "./StudentProfileClient";

export const metadata = {
  title: "Profile",
  description: "View and manage your student profile, including personal information, seat details, and previous period history.",
}

export default function SettingsPage() {
  return (
    <StudentProfileClient />
  )
}