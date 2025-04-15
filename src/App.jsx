import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import ProductPage from "@/routes/dashboard/product/products";
import AddProductForm from "@/routes/dashboard/product/AddProductForm";
import UserPage from "@/routes/dashboard/user/users";
import TransactionPage from "@/routes/dashboard/transaction/transactions";
function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                { index: true, element: <DashboardPage /> },
                { path: "analytics", element: <h1 className="title">Analytics</h1> },
                { path: "customers", element: <UserPage /> },
                { path: "transactions", element: <TransactionPage /> },
                { path: "products", element: <ProductPage /> },
                { path: "new-product", element: <AddProductForm /> },
                { path: "settings", element: <h1 className="title text-red-600">Logout</h1> },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
