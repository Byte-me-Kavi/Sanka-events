import Image from "next/image";
import LoginForm from "./_components/LoginForm";

export default function AdminLogin() {
  return (
    <main className="adm-login">
      <Image src="/images/sanka-logo.png" alt="SANKA" width={674} height={241} className="adm-login-logo" preload />
      <div className="adm-login-card">
        <h1>Backstage</h1>
        <p>Sign in to plan concert budgets.</p>
        <LoginForm />
      </div>
    </main>
  );
}
