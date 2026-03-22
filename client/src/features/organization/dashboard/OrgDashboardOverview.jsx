import React, { useState, useEffect } from "react";
import { Button, Group, Text, Avatar } from "@mantine/core";
import {
  Plus,
  UserPlus,
  Folder,
  Users,
  DollarSign,
  CheckSquare,
  Settings,
  Loader2,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { DashboardStatCard } from "./components/DashboardStatCard";
import { FinanceChartWidget } from "./components/FinanceChartWidget";
import { RecentActivityFeed } from "./components/RecentActivityFeed";
import { apiClient } from "../../../lib/axios";

export function OrgDashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await apiClient.get("/org/dashboard");
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { organization, metrics, recentActivities } = data || {};
  let orgName = organization?.name || "Startup LaunchPad";
  
  // Format org name if it's all uppercase for better aesthetics
  if (orgName === orgName.toUpperCase() && orgName.length > 3) {
    orgName = orgName.charAt(0).toUpperCase() + orgName.slice(1).toLowerCase();
  }

  const orgAvatarLetter = orgName.charAt(0).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <Motion.div
      className="space-y-8 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <Motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <Group align="center" gap="md">
          <Avatar
            size="lg"
            radius="md"
            className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold text-xl"
          >
            {orgAvatarLetter}
          </Avatar>
          <div>
            <Text
              size="xl"
              fw={800}
              className="text-text-primary dark:text-white leading-tight"
            >
              {getGreeting()}, {orgName}
            </Text>
            <Text size="sm" c="dimmed" mt={2}>
              Here's what's happening in your organization today.
            </Text>
          </div>
        </Group>

        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<UserPlus size={16} />}
            radius="md"
            className="border-border-light dark:border-border-dark dark:bg-surface-dark dark:text-gray-200"
          >
            Invite Member
          </Button>
          <Button
            leftSection={<Plus size={16} />}
            radius="md"
            className="bg-primary hover:bg-primary-dark text-white shadow-sm"
          >
            New Project
          </Button>
        </Group>
      </Motion.div>

      {/* KPI Stats Grid */}
      <Motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <DashboardStatCard
          title="Total Revenue"
          value={`$${(metrics?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="up"
          trendValue="12.5"
          color="teal"
        />
        <DashboardStatCard
          title="Active Projects"
          value={metrics?.activeProjects || 0}
          icon={Folder}
          trend="up"
          color="blue"
        />
        <DashboardStatCard
          title="Team Members"
          value={metrics?.memberCount || 0}
          icon={Users}
          trend="up"
          color="indigo"
        />
        <DashboardStatCard
          title="Pending Tasks"
          value={metrics?.pendingTasks || 0}
          icon={CheckSquare}
          color="orange"
        />
      </Motion.div>

      {/* Main Content Grid */}
      <Motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 flex flex-col">
          <FinanceChartWidget
            chartData={metrics?.revenueChartData || [0, 0, 0, 0, 0, 0, 0]}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <RecentActivityFeed activities={recentActivities || []} />
        </div>
      </Motion.div>

      {/* Optional: Secondary Row */}
      <Motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Placeholder for more widgets like Active Projects list or Upcoming meetings */}
        <div className="p-6 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center min-h-[150px]">
          <Text c="dimmed" size="sm" className="flex items-center gap-2">
            <Settings size={16} /> Integration module coming soon
          </Text>
        </div>
        <div className="p-6 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-center min-h-[150px]">
          <Text c="dimmed" size="sm" className="flex items-center gap-2">
            <Folder size={16} /> Project milestones module coming soon
          </Text>
        </div>
      </Motion.div>
    </Motion.div>
  );
}
