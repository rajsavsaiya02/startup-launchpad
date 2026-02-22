import React, { useState, useEffect } from "react";
import {
  Share2,
  Plus,
  MoreHorizontal,
  Search,
  MessageSquare,
  Paperclip,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { cn } from "../../../utils/cn";
import taskService from "../../../services/taskService";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskDrawer } from "../../operations/components/TaskDrawer";

export function OrgProjectTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("All");

  const fetchTasks = async () => {
    setIsTasksLoading(true);
    try {
      const data = await taskService.getAllTasks("organization");
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic Update
    const updatedTasks = tasks.map((t) =>
      t.id.toString() === taskId ? { ...t, kanban_status: newStatus } : t,
    );
    setTasks(updatedTasks);

    try {
      const task = tasks.find((t) => t.id.toString() === taskId);
      await taskService.updateTask(task.project_id, taskId, {
        kanban_status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(taskSearchQuery.toLowerCase());
    const matchesPriority =
      taskPriorityFilter === "All" || task.priority === taskPriorityFilter;
    return matchesSearch && matchesPriority;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.kanban_status === "todo"),
    progress: filteredTasks.filter((t) => t.kanban_status === "progress"),
    done: filteredTasks.filter((t) => t.kanban_status === "done"),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-background-dark overflow-hidden">
      {/* 1. Header */}
      <div className="shrink-0 px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 dark:text-white">
              Organization Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage all tasks across your organization's projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsTaskDrawerOpen(true);
              }}
              className="flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Board Area */}
      <div className="flex-1 overflow-hidden p-8 pt-6 flex flex-col gap-6">
        {/* Board Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2 items-center justify-between shrink-0">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-40 shrink-0">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6 min-w-max pb-8 overflow-x-auto no-scrollbar">
            <WorkColumn
              id="todo"
              title="To Do"
              count={tasksByStatus.todo.length}
              color="border-yellow-400"
            >
              {tasksByStatus.todo.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsTaskDrawerOpen(true);
                  }}
                />
              ))}
            </WorkColumn>
            <WorkColumn
              id="progress"
              title="In Progress"
              count={tasksByStatus.progress.length}
              color="border-primary"
            >
              {tasksByStatus.progress.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsTaskDrawerOpen(true);
                  }}
                />
              ))}
            </WorkColumn>
            <WorkColumn
              id="done"
              title="Done"
              count={tasksByStatus.done.length}
              color="border-green-500"
            >
              {tasksByStatus.done.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsTaskDrawerOpen(true);
                  }}
                />
              ))}
            </WorkColumn>
          </div>
        </DragDropContext>
      </div>

      <TaskDrawer
        task={selectedTask}
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        onRefresh={fetchTasks}
      />
    </div>
  );
}

// --- Shared Components for Work ---

function WorkColumn({ id, title, count, color, children }) {
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
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "flex flex-1 flex-col gap-4 overflow-y-auto pr-2 pb-4 custom-scrollbar h-full min-h-[200px] transition-colors rounded-lg",
              snapshot.isDraggingOver
                ? "bg-gray-100/50 dark:bg-gray-800/30"
                : "",
            )}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TaskCard({ task, index, onClick }) {
  const priorityColors = {
    High: "text-error bg-error/10 border-error/20",
    Medium: "text-warning bg-warning/10 border-warning/20",
    Low: "text-success bg-success/10 border-success/20",
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          style={{ ...provided.draggableProps.style }}
          className={cn(
            "bg-white dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/50 relative",
            snapshot.isDragging
              ? "shadow-2xl ring-2 ring-primary/50 rotate-2 z-50"
              : "",
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2 items-center">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
              {task.project_title && (
                <span className="text-[10px] font-semibold text-text-tertiary uppercase px-1">
                  {task.project_title}
                </span>
              )}
            </div>
            <button className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-primary transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <h4 className="text-sm font-semibold text-text-primary dark:text-white mb-2 leading-snug">
            {task.title}
          </h4>

          <div className="flex justify-between items-center pt-3 border-t border-border-light dark:border-border-dark border-dashed mt-3">
            <div className="flex items-center gap-3">
              {(task.comments_count > 0 || task.comments > 0) && (
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <MessageSquare className="h-3 w-3" />{" "}
                  {task.comments_count || task.comments}
                </div>
              )}
              {(task.files_count > 0 || task.files > 0) && (
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <Paperclip className="h-3 w-3" />{" "}
                  {task.files_count || task.files}
                </div>
              )}
            </div>
            <div className="flex -space-x-2">
              {(task.assignee_ids || []).map((id, i) => (
                <Avatar
                  key={i}
                  src={`https://i.pravatar.cc/30?u=${id}`}
                  size="xs"
                  className="border-2 border-white dark:border-surface-dark ring-0"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
