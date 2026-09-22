import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Inscription — Loca",
};

export default function RegisterPage() {
  return <RegisterForm />;
}