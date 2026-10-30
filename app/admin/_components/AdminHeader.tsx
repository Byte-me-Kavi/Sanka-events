import Image from "next/image";
import Link from "next/link";
import { SignOut } from "@phosphor-icons/react/ssr";
import { signOut } from "../actions";
import { PasswordButton } from "./PasswordSheet";

export function AdminHeader() {
  return (
    <header className="adm-top">
      <div className="adm-top-inner">
        <Link href="/admin/concerts" className="adm-top-brand">
          <Image src="/images/sanka-logo.png" alt="SANKA" width={674} height={241} />
          <span>Budget planner</span>
        </Link>
        <div className="adm-top-actions">
          <PasswordButton />
          <form action={signOut}>
            <button type="submit" className="adm-top-btn">
              <SignOut size={18} aria-hidden />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
