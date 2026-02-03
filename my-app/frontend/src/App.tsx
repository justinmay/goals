import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { HomeRoute } from "@/routes/Home";
import { GoalsRoute } from "@/routes/Goals";
import { GoalDetailRoute } from "@/routes/GoalDetail";
import { TodosRoute } from "@/routes/Todos";

function App() {
  return (
    <HashRouter>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-4">
            <SidebarTrigger className="mb-4" />
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/goals" element={<GoalsRoute />} />
              <Route path="/goals/:id" element={<GoalDetailRoute />} />
              <Route path="/todos" element={<TodosRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HashRouter>
  );
}

export default App;
