import Image from "next/image";
import Link from "next/link";
import { SignOut } from "@phosphor-icons/react/ssr";
import { signOut } from "../actions";

export function AdminHeader() {
  return (
    <header className="adm-top">
      <div className="adm-top-inner">
        <Link href="/admin/concerts" className="adm-top-brand">
          <Image src="/images/sanka-logo.png" alt="SANKA" width={674} height={241} />
          <span>Budget planner</span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="adm-top-signout">
            <SignOut size={18} aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
