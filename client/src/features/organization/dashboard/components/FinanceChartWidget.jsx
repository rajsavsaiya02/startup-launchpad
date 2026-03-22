import React from 'react';
import { Card, Text, Group, ActionIcon } from '@mantine/core';
import ReactECharts from 'echarts-for-react';
import { TrendingUp } from 'lucide-react';

export function FinanceChartWidget({ chartData = [0, 0, 0, 0, 0, 0, 0] }) {
  const options = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      textStyle: { color: '#fff' },
      borderWidth: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      splitLine: { 
        lineStyle: { 
          color: 'rgba(156, 163, 175, 0.1)',
          type: 'dashed'
        } 
      },
      axisLabel: { color: '#9CA3AF' }
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        data: chartData,
        lineStyle: {
          color: '#3B82F6', // blue-500
          width: 4,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#3B82F6',
          borderColor: '#ffffff',
          borderWidth: 2
        }
      }
    ]
  };

  return (
    <Card 
      withBorder 
      radius="lg" 
      padding="xl"
      className="bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark shadow-sm h-full flex flex-col"
    >
      <Group justify="space-between" mb="md">
        <div>
          <Text size="lg" fw={700} className="text-text-primary dark:text-gray-100">
            Financial Overview
          </Text>
          <Text size="xs" c="dimmed">
            Weekly revenue breakdown
          </Text>
        </div>
        <ActionIcon variant="light" color="blue" radius="xl">
          <TrendingUp size={18} />
        </ActionIcon>
      </Group>

      <div className="flex-1 w-full h-[250px]">
        <ReactECharts
          option={options}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </Card>
  );
}
