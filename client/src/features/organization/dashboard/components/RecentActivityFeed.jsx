import React from "react";
import { Card, Text, Avatar, Group, Stack, ActionIcon } from "@mantine/core";
import { motion as Motion } from "framer-motion";
import { Activity, Clock, ExternalLink } from "lucide-react";

export function RecentActivityFeed({ activities = [] }) {
  // We'll map the backend activity format (description, created_at, user) to our clean UI
  const hasActivities = activities && activities.length > 0;

  return (
    <Card
      withBorder
      radius="lg"
      padding="xl"
      className="bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark h-full shadow-sm"
    >
      <Group justify="space-between" mb="lg">
        <Text
          size="lg"
          fw={700}
          className="text-text-primary dark:text-gray-100"
        >
          Recent Activity
        </Text>
        <ActionIcon variant="subtle" color="gray" radius="xl">
          <ExternalLink size={18} />
        </ActionIcon>
      </Group>

      <Stack gap="lg" className="flex-1">
        {!hasActivities ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-70">
            <Avatar size="xl" radius="md" className="bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
              <Clock size={28} />
            </Avatar>
            <Text size="sm" fw={600} className="text-text-primary dark:text-gray-200">
              No Activities Yet
            </Text>
            <Text size="xs" c="dimmed" mt={4} className="max-w-[200px]">
              When members perform actions in the organization, they will appear here.
            </Text>
          </div>
        ) : (
          activities.map((activity, index) => {
            const IconComp = activity.icon || Activity;
            const timeLabel = activity.created_at
              ? new Date(activity.created_at).toLocaleDateString()
              : activity.timestamp;
            const titleLabel = activity.first_name
              ? `${activity.first_name} ${activity.last_name || ""}`
              : "System";

            return (
              <Motion.div
                key={activity.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Group wrap="nowrap" align="flex-start">
                  <Avatar color={activity.color || "blue"} radius="xl" size="md">
                    <IconComp size={18} />
                  </Avatar>

                  <div style={{ flex: 1 }}>
                    <Text
                      size="sm"
                      fw={600}
                      className="text-text-primary dark:text-gray-200"
                    >
                      {titleLabel}{" "}
                      <span className="text-gray-400 font-normal text-xs ml-1">
                        in {activity.project_name || "Organization"}
                      </span>
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                      {activity.description}
                    </Text>
                  </div>

                  <Text size="xs" c="dimmed" className="whitespace-nowrap">
                    {timeLabel}
                  </Text>
                </Group>
              </Motion.div>
            );
          })
        )}
      </Stack>
    </Card>
  );
}
