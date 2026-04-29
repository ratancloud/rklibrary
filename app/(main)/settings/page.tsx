import LibrarySettingsClient from "./LibrarySettingsClient";

export const metadata = {
  title: "Settings",
  description: "Manage your library settings, including basic details, shifts, and floors. Keep your library information up-to-date and organized for a seamless experience.",
}

export default function SettingsPage() {
  return (
    <LibrarySettingsClient />
  )
}