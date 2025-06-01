import React from "react";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

export default function Layout(props) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <SideBar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="p-6 md:p-8 overflow-auto bg-transparent flex-1 rounded-tl-3xl shadow-inner">
          {props.children}
        </main>
      </div>
    </div>
  );
}
