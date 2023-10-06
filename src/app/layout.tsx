import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
