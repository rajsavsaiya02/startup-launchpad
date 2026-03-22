import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { Loader2, UserX } from "lucide-react";
import { apiClient } from "../../lib/axios";
import { Button } from "../../components/ui/Button";

import { PublicProfilePage } from "../talent/PublicProfilePage";
import { OrgPublicProfilePage } from "../organization/public/OrgPublicProfilePage";

export function CommunityProfilePage() {
  const { slug } = useParams();
  const [profileType, setProfileType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchProfileType = async () => {
      try {
        const response = await apiClient.get(`/community/profile/${slug}`);
        setProfileType(response.data.type);
      } catch (err) {
        if (err.response?.status === 403 && err.response?.data?.isPrivate) {
          setIsPrivate(true);
        } else if (err.response?.status === 404) {
          setError("Profile not found.");
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileType();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isPrivate) {
    return <Navigate to="/?error=private_profile" replace />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-10 shadow-xl max-w-md">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Profile Unavailable
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/community">
            <Button variant="primary" className="w-full">
              Return to Community
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (profileType === "user") {
    return <PublicProfilePage overrideUsername={slug} />;
  }

  if (profileType === "organization") {
    return <OrgPublicProfilePage overrideSlug={slug} />;
  }

  return null;
}
