"use client";

import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Check, ChevronsUpDown, Search, CheckSquare, Square, X } from "lucide-react";
import { cn } from "~/lib/utils";

export interface ClassOption {
  classId: string;
  grade: string;
  section: string;
}

interface MultiSelectClassDropdownProps {
  classes: ClassOption[];
  selectedClassIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectClassDropdown({
  classes = [],
  selectedClassIds = [],
  onChange,
  placeholder = "Select classes...",
  className,
  disabled = false,
}: MultiSelectClassDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    const query = search.toLowerCase();
    return classes.filter(
      (c) =>
        c.grade.toLowerCase().includes(query) ||
        c.section.toLowerCase().includes(query) ||
        `grade ${c.grade} ${c.section}`.toLowerCase().includes(query)
    );
  }, [classes, search]);

  const allSelected =
    classes.length > 0 && selectedClassIds.length === classes.length;
  const isSomeSelected =
    selectedClassIds.length > 0 && selectedClassIds.length < classes.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(classes.map((c) => c.classId));
    }
  };

  const toggleClass = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      onChange(selectedClassIds.filter((id) => id !== classId));
    } else {
      onChange([...selectedClassIds, classId]);
    }
  };

  const labelText = useMemo(() => {
    if (selectedClassIds.length === 0) return placeholder;
    if (selectedClassIds.length === classes.length && classes.length > 0) {
      return `All Classes (${classes.length})`;
    }
    if (selectedClassIds.length === 1) {
      const found = classes.find((c) => c.classId === selectedClassIds[0]);
      return found ? `${found.grade} ${found.section}` : "1 Class Selected";
    }
    if (selectedClassIds.length <= 2) {
      const names = selectedClassIds
        .map((id) => {
          const found = classes.find((c) => c.classId === id);
          return found ? `${found.grade} ${found.section}` : "";
        })
        .filter(Boolean);
      return names.join(", ");
    }
    return `${selectedClassIds.length} Classes Selected`;
  }, [selectedClassIds, classes, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between border-slate-200 bg-white font-normal text-slate-900 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-white/5 h-9 px-3 text-sm transition-all focus:ring-1 focus:ring-emerald-500",
            selectedClassIds.length === 0 && "text-muted-foreground dark:text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="truncate">{labelText}</span>
            {selectedClassIds.length > 0 && selectedClassIds.length < classes.length && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 rounded-full px-1.5 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-none font-bold"
              >
                {selectedClassIds.length}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-500 dark:text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 border border-slate-200 bg-white shadow-lg dark:border-border dark:bg-slate-900 text-slate-900 dark:text-foreground z-50 rounded-lg overflow-hidden"
        align="start"
      >
        {/* Search Bar */}
        <div className="flex items-center border-b border-slate-100 dark:border-border px-3 py-2 bg-slate-50/50 dark:bg-black/20">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-none bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-foreground placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-border px-3 py-2 bg-slate-50 dark:bg-white/5 text-xs font-medium">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-3.5 w-3.5" /> Deselect All
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5" /> Select All ({classes.length})
              </>
            )}
          </button>
          <span className="text-[11px] text-muted-foreground">
            {selectedClassIds.length} of {classes.length} selected
          </span>
        </div>

        {/* Class Items List */}
        <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
          {filteredClasses.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No classes found.
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const isSelected = selectedClassIds.includes(cls.classId);
              return (
                <div
                  key={cls.classId}
                  onClick={() => toggleClass(cls.classId)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-2 text-xs rounded-md cursor-pointer select-none transition-colors",
                    isSelected
                      ? "bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-500/15 dark:text-emerald-200"
                      : "hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Checkmark Box */}
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors shrink-0",
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span>
                      {cls.grade} {cls.section}
                    </span>
                  </div>
                  {isSelected && (
                    <Badge
                      variant="outline"
                      className="text-[9px] border-emerald-300 bg-emerald-100/50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 py-0 h-4 px-1"
                    >
                      Selected
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
