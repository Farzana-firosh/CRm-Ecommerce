import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Box,
  FileText,
  ClipboardList,
  FileBarChart,
  UserCircle,
  Store,
  LogInIcon,
  Menu,
  Settings,
} from "lucide-react";
import { useTranslation } from "../Components/Context/LanguageContext";

export default function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, language } = useTranslation();

  const storedUser = localStorage.getItem("currentUser");
  const CurrentUser = storedUser
    ? JSON.parse(storedUser)
    : { name: "Guest", email: "", role: "" };

  const loginTime = localStorage.getItem("loginTime");
  const maxSession = 30 * 60 * 1000;

  if (loginTime && Date.now() - loginTime > maxSession) {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loginTime");
    window.location.href = "/login";
  }

  const sidebarBg = "bg-gradient-to-b from-blue-900 via-blue-700 to-sky-600";
  const accentText = "text-blue-100";
  const accentIcon = "text-blue-300";
  const activeBg = "bg-blue-600";
  const hoverBg = "hover:bg-blue-700";
  const activeText = "text-white";
  const hoverText = "hover:text-white";
  const normalText = "text-blue-100";
  const sectionTitle =
    "text-xs text-blue-200 uppercase mb-2 tracking-widest font-semibold";

  const rtl = language === "ar" ? "rtl" : "ltr";

  return (
    <>
      {/* Toggle button  */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-700 text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-64 ${sidebarBg} text-white flex flex-col justify-between p-0 shadow-2xl
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
        style={{ minHeight: "100vh", direction: rtl }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 pb-1 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Store size={26} className={accentIcon} />
              <span className="text-lg font-extrabold tracking-tight text-white">
                {t("crm_commerce")}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-700/80 rounded-lg px-3 py-2 mb-2">
              <UserCircle size={22} className="text-blue-200" />
              <div>
                <p className="font-semibold capitalize text-blue-100 flex items-center gap-2">
                  {CurrentUser.role ? t(CurrentUser.role) : t("guest")}{" "}
                  {t("user")}
                </p>
                <p className="text-xs text-blue-200">
                  {CurrentUser.role === "admin"
                    ? t("admin_user")
                    : CurrentUser.email || ""}
                </p>
                <p className="text-xs text-blue-200">
                  {t("org_id")}: {CurrentUser.orgId}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 overflow-y-auto">
            <p className={sectionTitle}>{t("main_navigation")}</p>
            <ul className="space-y-1 mb-3">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                  ${
                    isActive
                      ? `${activeBg} ${activeText} shadow`
                      : `${hoverBg} ${hoverText} ${normalText}`
                  }`
                  }
                >
                  <LayoutDashboard size={18} /> {t("dashboard")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contacts"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                  ${
                    isActive
                      ? `${activeBg} ${activeText} shadow`
                      : `${hoverBg} ${hoverText} ${normalText}`
                  }`
                  }
                >
                  <Users size={18} /> {t("contacts")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                  ${
                    isActive
                      ? `${activeBg} ${activeText} shadow`
                      : `${hoverBg} ${hoverText} ${normalText}`
                  }`
                  }
                >
                  <Box size={18} /> {t("products")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                  ${
                    isActive
                      ? `${activeBg} ${activeText} shadow`
                      : `${hoverBg} ${hoverText} ${normalText}`
                  }`
                  }
                >
                  <Settings size={18} /> {t("settings")}
                </NavLink>
              </li>
            </ul>

            {(CurrentUser.role === "admin" || CurrentUser.role === "sales") && (
              <>
                <p className={sectionTitle}>{t("sales_process")}</p>
                <ul className="space-y-1 mb-3">
                  <li>
                    <NavLink
                      to="/quotations"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                      ${
                        isActive
                          ? `${activeBg} ${activeText} shadow`
                          : `${hoverBg} ${hoverText} ${normalText}`
                      }`
                      }
                    >
                      <FileText size={18} /> {t("quotations")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/sales-order"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                      ${
                        isActive
                          ? `${activeBg} ${activeText} shadow`
                          : `${hoverBg} ${hoverText} ${normalText}`
                      }`
                      }
                    >
                      <ClipboardList size={18} /> {t("sales_order")}
                    </NavLink>
                  </li>
                </ul>
              </>
            )}

            {(CurrentUser.role === "admin" ||
              CurrentUser.role === "finance") && (
              <>
                <p className={sectionTitle}>{t("finance")}</p>
                <ul className="space-y-1 mb-3">
                  <li>
                    <NavLink
                      to="/invoices"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                      ${
                        isActive
                          ? `${activeBg} ${activeText} shadow`
                          : `${hoverBg} ${hoverText} ${normalText}`
                      }`
                      }
                    >
                      <FileText size={18} /> {t("invoices")}
                    </NavLink>
                  </li>
                </ul>
              </>
            )}

            {CurrentUser.role === "admin" && (
              <>
                <p className={sectionTitle}>{t("reports")}</p>
                <ul className="space-y-1 mb-3">
                  <li>
                    <NavLink
                      to="/reports"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                      ${
                        isActive
                          ? `${activeBg} ${activeText} shadow`
                          : `${hoverBg} ${hoverText} ${normalText}`
                      }`
                      }
                    >
                      <FileBarChart size={18} /> {t("sales_reports")}
                    </NavLink>
                  </li>
                </ul>
              </>
            )}

            <ul className="space-y-1 mb-1">
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium
                  ${
                    isActive
                      ? `${activeBg} ${activeText} shadow`
                      : `${hoverBg} ${hoverText} ${normalText}`
                  }`
                  }
                >
                  <LogInIcon size={18} /> {t("user_login")}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
