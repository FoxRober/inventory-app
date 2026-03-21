import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastContainer from "@/components/Notifications/ToastContainer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="page-container">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
    </NotificationProvider>
  );
}
