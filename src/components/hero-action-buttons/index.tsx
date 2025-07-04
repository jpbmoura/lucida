import { Button } from "../ui/button";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

export default function ActionButtons() {
  return (
    <div className="flex flex-row gap-4 text-white z-10">
      <Link href="/waitlist">
        <Button className="dark">Entrar na Lista de Espera</Button>
      </Link>

      <Link href="/how-it-works">
        <Button variant="outline" className="dark">
          Entenda como Funciona
        </Button>
      </Link>
    </div>
  );
}
