import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "ShitTodo — Get Stuff Done",
  description: "A minimalist todo app to keep track of everything you need to do. Clean, fast, and delightful.",
  keywords: ["todo", "tasks", "productivity", "minimalist"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
