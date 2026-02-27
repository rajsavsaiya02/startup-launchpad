import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "framer-motion";

export function CreatableSelect({
  options = [],
  value,
  onChange,
  onCreateOption,
  onDeleteOption,
  placeholder = "Select an option",
  label,
  className,
  name,
  disabled,
  allowCreate = true,
  allowDelete = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setInputValue("");
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) return;
    if (onCreateOption) {
      await onCreateOption(inputValue.trim());
      handleSelect(inputValue.trim()); // Auto-select the new option
    }
    setInputValue("");
    setIsCreating(false);
  };

  const handleDelete = async (e, option) => {
    e.stopPropagation(); // Prevent selecting the option when deleting
    if (onDeleteOption) {
      await onDeleteOption(option);
      // If deleted option was selected, clear selection
      if (value === option) {
        onChange({ target: { name, value: "" } });
      }
    }
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const MotionDiv = motion.div;

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-text-secondary dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative group">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full h-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-left text-sm px-3 flex items-center justify-between focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all",
            disabled
              ? "opacity-70 cursor-not-allowed"
              : "hover:border-gray-400 dark:hover:border-gray-600",
            !value && "text-text-tertiary",
          )}
        >
          <span className="truncate text-text-primary dark:text-white">
            {value || placeholder}
          </span>
          {!disabled && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-text-tertiary transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <MotionDiv
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1E293B] border border-border-light dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Search input */}
              <div className="p-2 border-b border-border-light dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                      value === option
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
                    )}
                  >
                    <span>{option}</span>
                    {onDeleteOption && allowDelete && (
                      <button
                        onClick={(e) => handleDelete(e, option)}
                        className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-text-tertiary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete option"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {filteredOptions.length === 0 && !isCreating && (
                  <div className="px-3 py-10 text-xs text-text-tertiary text-center">
                    {searchTerm ? "No matches found" : "No options available"}
                  </div>
                )}
              </div>

              {allowCreate && (
                <div className="border-t border-border-light dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/50">
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter new option..."
                        className="flex-1 h-8 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreate();
                          } else if (e.key === "Escape") {
                            setIsCreating(false);
                            setInputValue("");
                          }
                        }}
                      />
                      <button
                        onClick={handleCreate}
                        disabled={!inputValue.trim()}
                        className="p-1.5 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setInputValue("");
                        }}
                        className="p-1.5 bg-gray-200 dark:bg-gray-700 text-text-secondary rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-md py-1.5 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create New
                    </button>
                  )}
                </div>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
