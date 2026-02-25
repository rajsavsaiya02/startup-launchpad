import React, { useState } from "react";
import { LayoutContext } from "./LayoutContextStore";

export const LayoutProvider = ({ children }) => {
  const [isSidebarHidden, setSidebarHidden] = useState(false);

  return (
    <LayoutContext.Provider value={{ isSidebarHidden, setSidebarHidden }}>
      {children}
    </LayoutContext.Provider>
  );
};
