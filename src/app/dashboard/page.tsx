"use client"
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import MediusDashboard from "../components/ui/dashboard";
import { useState } from "react";

export default function DashboardPage() {
  const { userId } = useAuth();
  // Ensure all hooks are called unconditionally at the top level
  const [state, setState] = useState(null);

  if (!userId) {
    redirect("/sign-up");
  }

  return (
    <div>
      <MediusDashboard />
    </div>
  );
}
