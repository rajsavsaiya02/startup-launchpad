import React from 'react';
import { Card, Text, Group, Badge, ThemeIcon, Stack } from '@mantine/core';
import { motion as Motion } from 'framer-motion';

export function DashboardStatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) {
  const isPositive = trend === 'up';
  
  return (
    <Motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        withBorder
        padding="lg"
        radius="lg"
        className="bg-surface-light dark:bg-surface-dark/60 border-border-light dark:border-border-dark backdrop-blur-md shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <Group justify="space-between" align="flex-start" mb="xs">
          <Text size="sm" fw={600} c="dimmed" tt="uppercase" className="tracking-wider">
            {title}
          </Text>
          <ThemeIcon variant="light" size="lg" radius="md" color={color}>
            <Icon size={20} stroke={2} />
          </ThemeIcon>
        </Group>

        <Stack gap="xs" mt={10}>
          <Text size="xl" fw={700} className="text-3xl text-text-primary dark:text-gray-100 font-bold">
            {value}
          </Text>
          
          {trendValue && (
            <Group gap="xs" align="center">
              <Badge 
                color={isPositive ? 'teal' : 'red'} 
                variant="light" 
                size="sm"
                className="font-semibold"
              >
                {isPositive ? '+' : '-'}{trendValue}%
              </Badge>
              <Text size="xs" c="dimmed">
                vs last month
              </Text>
            </Group>
          )}
        </Stack>
      </Card>
    </Motion.div>
  );
}
