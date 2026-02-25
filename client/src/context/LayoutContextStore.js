import { createContext, useContext } from "react";

export const LayoutContext = createContext({
  isSidebarHidden: false,
  setSidebarHidden: () => {},
});

export const useLayout = () => useContext(LayoutContext);
