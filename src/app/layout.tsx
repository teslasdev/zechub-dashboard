import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";


export const metadata: Metadata = {
  title: "Zeanalystics",
  description: "Zeanalystics - Privacy-Preserving Analytics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
