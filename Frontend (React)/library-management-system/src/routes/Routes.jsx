import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import ContactUs from "../pages/ContactUs";
import AllBooks from "../pages/AllBooks";
import ErrorPage from "../pages/ErrorPage";
import BookDetails from "../pages/BookDetails";
import Dashboard from "../layout/Dashboard";
import MyReserve from "../pages/MyReserve";
import Forbidden from "../pages/Forbidden";
import PrivateRoute from "./PrivateRoute";
import UserProfile from "../pages/UserProfile";
import ManageBooks from "../pages/admin/ManageBooks";
import ManageUsers from "../pages/admin/ManageUsers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/allBooks",
        element: <AllBooks />,
      },
      {
        path: "/books/:id",
        element: <PrivateRoute><BookDetails /></PrivateRoute>,
      },
      {
        path: "/profile",
        element: <PrivateRoute><UserProfile /></PrivateRoute>,
      },
    ],
  },
  {
    path: "/*",
    element: <ErrorPage />,
  },
  {
    path: "/forbidden",
    element: <Forbidden />,
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
    children: [
      {
        path: "myReserve",
        element: <MyReserve />,
      },
      {
        path: "manageBooks",
        element: <ManageBooks />,
      },
      {
        path: "manageUsers",
        element: <ManageUsers />,
      },
    ],
  },
]);

export default router;
