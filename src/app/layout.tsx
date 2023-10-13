import { ReactNode } from "react";
import "../../editor.css";
import "./preflight.css";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body style={{ padding: "2rem" }}>{children}</body>
    </html>
  );
}
