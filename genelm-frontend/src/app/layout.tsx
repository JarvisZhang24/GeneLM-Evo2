import "~/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "GeneLM Evo2 | GRCh38 Variant Research",
  description:
    "Research interface for GRCh38 gene exploration and Evo2-7B single-nucleotide variant likelihood scoring.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
