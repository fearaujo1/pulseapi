import EquipamentosPage from "./pages/EquipamentosPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: "12px",
                        padding: "14px 16px",
                        fontSize: "14px",
                    },
                }}
            />
          <EquipamentosPage />;
          {/* resto da aplicação */}
        </>
      )

}

export default App;