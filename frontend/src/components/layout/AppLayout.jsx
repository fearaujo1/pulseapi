import { Outlet } from "react-router-dom";

function AppLayout() {
    return (
        <div className="min-h-screen lg:ml-[270px] bg-[#f5f7fb]">
            <Outlet />
        </div>
    );
}

export default AppLayout;