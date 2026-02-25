import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { apiClient } from "../../lib/axios";
import { OrgOnboarding } from "../../features/organization/onboarding/OrgOnboarding";
import { Loader2 } from "lucide-react";
import { useLayout } from "../../context/LayoutContextStore";

export function OrgGuard() {
  const [hasOrg, setHasOrg] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setSidebarHidden } = useLayout();

  const checkOrg = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.get("/org");
      setHasOrg(true);
      setSidebarHidden(false);
    } catch {
      setHasOrg(false);
      setSidebarHidden(true);
    } finally {
      setIsLoading(false);
    }
  }, [setSidebarHidden]);

  useEffect(() => {
    checkOrg();

    // Cleanup: Ensure sidebar is shown when leaving organization context
    // (though UserLayout handles it usually by re-rendering if it were a local state,
    // but here it's a context)
    return () => setSidebarHidden(false);
  }, [checkOrg, setSidebarHidden]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasOrg) {
    return <OrgOnboarding onComplete={checkOrg} />;
  }

  return <Outlet />;
}
