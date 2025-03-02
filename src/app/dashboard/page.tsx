"use client"
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import MediusDashboard from "../components/ui/dashboard";

export default function DashboardPage() {
  const { userId } = useAuth();

  if (!userId) {
    redirect("/sign-up");
  }

  return (
    <div>
      <MediusDashboard />
    </div>
  );
}
