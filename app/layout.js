import "@fontsource-variable/inter";
import "./globals.css";
import TitleBar from "@/components/TitleBar";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "ShitTodo — Get Stuff Done",
  description: "A minimalist todo app to keep track of everything you need to do. Clean, fast, and delightful.",
  keywords: ["todo", "tasks", "productivity", "minimalist"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <ToastProvider>
          <TitleBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
