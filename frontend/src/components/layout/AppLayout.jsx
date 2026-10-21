import { Outlet } from "react-router-dom";

function AppLayout() {
    return (
        <div className="min-h-screen bg-[#f4f6f8] lg:ml-[248px]">
            <Outlet />
        </div>
    );
}

export default AppLayout;
