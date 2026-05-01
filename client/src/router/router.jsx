import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import MainLayout from "../landing/MainLayout";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";
import DashBoardHome from "../pages/DashBoardHome";
import DashBoardIncident from "../pages/DashBoardIncident";
import DashBoardAlert from "../pages/DashBoardAlert";
import DashBoardAnalytics from "../pages/DashBoardAnalytics";
import DashBoardTeam from "../pages/DashBoardTeam";
import DashBoardMemberDetails from "../pages/DashBoardMemberDetails";
import DashBoardAlertDetail from "../pages/DashBoardAlertDetail";
import DashBoardIncidentDetails from "../pages/DashBoardIncidentDetails";
import DashBoardPlayBook from "../pages/DashBoardPlayBook";
import CreateIncident from "../pages/CreateIncident";
import DashBoardSetting from "../pages/DashBoardSetting";
import Profile from "../pages/Profile";
import AdminMain from "../admin/AdminMain";
import AdminHome from "../admin/AdminHome";
import AdminUserManagement from "../admin/AdminUserManagement";
import AdminActivity from "../admin/AdminActivity";
import AdminRoles from "../admin/AdminRoles";




export const router = createBrowserRouter([

    // landingpage layout
    {
        path: "/",
        element: <MainLayout />,
        children: [

        ]
    },

    {
        path: "/home",
        element: <Layout />,
        children: [
            {
                index: true,   // ✅ correct way for default route
                element: <DashBoardHome />
            },
            {
                path: "incidents",  // ✅ relative path
                element: <DashBoardIncident />
            },
            {
                path: "alerts",
                element: <DashBoardAlert />
            },
            {
                path: "analytics",
                element: <DashBoardAnalytics />
            },
            {
                path: "team",
                element: <DashBoardTeam />
            },
            {
                path: "member_details",
                element: <DashBoardMemberDetails />
            },
            {
                path: "alert_details",
                element: <DashBoardAlertDetail />
            },
            {
                path: "incident_details",
                element: <DashBoardIncidentDetails />
            },
            {
                path: "play_book",
                element: <DashBoardPlayBook />
            },
            {
                path: "create_incident",
                element: <CreateIncident />
            },
            {
                path: "user_settings",
                element: <DashBoardSetting />
            },
            {
                path: "profile",
                element: <Profile />
            }
        ]
    },

    {
        path: "/admin",
        element: <AdminMain />,
        children: [
            {
                index:true,
                element: <AdminHome />
            },
            {
                path:"users",
                element:<AdminUserManagement/>
            },
            {
                path:"activity",
                element:<AdminActivity/>
            },
            {
                path:"roles",
                element:<AdminRoles/>
            }
        ]
    },

    // auth layout
    {
        path: "/signin",
        element: <SignIn />
    },
    {
        path: "/signup",
        element: <SignUp />
    },
])


