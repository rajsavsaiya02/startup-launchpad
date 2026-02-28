import React, { useState, useEffect } from "react";
import { MoreHorizontal, MessageSquare, Paperclip, Plus } from "lucide-react";
import { Avatar } from "../../../../components/ui/Avatar";
import taskService from "../../../../services/taskService";

export function OrgProjectBoardTab({ projectId, onTaskSelect }) {
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTasks(projectId);

        // Let's assume the task service returns a flat array of tasks that we categorize
        if (isMounted) {
          if (Array.isArray(data)) {
            const categorized = {
              todo: data.filter((t) => t.status === "To Do"),
              inProgress: data.filter((t) => t.status === "In Progress"),
              done: data.filter((t) => t.status === "Done"),
            };
            setTasks(categorized);
          } else {
            // fallback generic mock data structure just in case
            setTasks({ todo: [], inProgress: [], done: [] });
          }
        }
      } catch (err) {
        console.error("Failed to load tasks for board:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (projectId) loadTasks();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-text-tertiary">Loading board...</div>
    );
  }

  return (
    <div className="flex h-full gap-6 min-w-max">
      <BoardColumn
        title="To Do"
        count={tasks.todo.length}
        color="border-yellow-400"
      >
        {tasks.todo.map((task) => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onClick={() => onTaskSelect(task)}
          />
        ))}
      </BoardColumn>
      <BoardColumn
        title="In Progress"
        count={tasks.inProgress.length}
        color="border-primary"
      >
        {tasks.inProgress.map((task) => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onClick={() => onTaskSelect(task)}
          />
        ))}
      </BoardColumn>
      <BoardColumn
        title="Done"
        count={tasks.done.length}
        color="border-success"
      >
        {tasks.done.map((task) => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onClick={() => onTaskSelect(task)}
          />
        ))}
      </BoardColumn>
    </div>
  );
}

function BoardColumn({ title, count, color, children }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col h-full">
      <div
        className={`relative border-b-2 ${color} pb-3 mb-4 flex justify-between items-center`}
      >
        <h2 className="text-lg font-semibold text-text-primary dark:text-white">
          {title}
        </h2>
        <span className="text-sm font-medium text-text-tertiary bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full tabular-nums">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 custom-scrollbar h-full">
        {children}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  const priorityColors = {
    High: "text-error bg-error/10 border-error/20",
    Medium: "text-warning bg-warning/10 border-warning/20",
    Low: "text-success bg-success/10 border-success/20",
  };
  const pColor = priorityColors[task.priority] || priorityColors.Medium;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/50"
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pColor}`}
        >
          {task.priority || "Medium"}
        </span>
        <button className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-primary transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h4 className="text-sm font-semibold text-text-primary dark:text-white mb-2 leading-snug">
        {task.title}
      </h4>

      <div className="flex justify-between items-center pt-3 border-t border-border-light dark:border-border-dark border-dashed mt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <MessageSquare className="h-3 w-3" /> 0
          </div>
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Paperclip className="h-3 w-3" /> 0
          </div>
        </div>
        <div className="flex -space-x-2">
          {(task.assignees || task.assignee_ids || []).map((assignee, i) => (
            <Avatar
              key={i}
              src={`https://i.pravatar.cc/30?u=${assignee?._id || assignee?.id || assignee}`}
              size="xs"
              className="border-2 border-white dark:border-surface-dark ring-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
