import type { Metadata } from "next";
import "./admin.css";

// Hidden area: keep it out of search engines and link previews.
export const metadata: Metadata = {
  title: "SANKA Backstage",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="adm">{children}</div>;
}
