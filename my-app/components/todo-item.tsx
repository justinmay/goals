'use client';

import { useState } from 'react';
import { Todo, Tag, SubTask } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagInput } from '@/components/tag-input';
import { Check, GripVertical, Pencil, Trash2, X, ArrowRight, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoItemProps {
  todo: Todo;
  tags: Tag[];
  onToggle: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  onDelete?: (id: string) => void;
  onCreateTag: (tag: Tag) => Promise<Tag | null>;
  isDraggable?: boolean;
  onAddToToday?: (todo: Todo) => void;
}

export function TodoItem({ todo, tags, onToggle, onUpdate, onDelete, onCreateTag, isDraggable = false, onAddToToday }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editTagIds, setEditTagIds] = useState<string[]>(todo.tagIds || []);
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDraggable });

  const todoTags = tags.filter(t => todo.tagIds?.includes(t.id));

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate({ ...todo, text: editText.trim(), tagIds: editTagIds });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditTagIds(todo.tagIds || []);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAddSubTask = () => {
    if (newSubTaskText.trim()) {
      const newSubTask: SubTask = {
        id: crypto.randomUUID(),
        text: newSubTaskText.trim(),
        completed: false,
      };
      onUpdate({ ...todo, subTasks: [...(todo.subTasks || []), newSubTask] });
      setNewSubTaskText('');
      setIsAddingSubTask(false);
    }
  };

  const handleToggleSubTask = (subTaskId: string) => {
    const updatedSubTasks = (todo.subTasks || []).map(st =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate({ ...todo, subTasks: updatedSubTasks });
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    const updatedSubTasks = (todo.subTasks || []).filter(st => st.id !== subTaskId);
    onUpdate({ ...todo, subTasks: updatedSubTasks });
  };

  const handleSubTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubTask();
    } else if (e.key === 'Escape') {
      setNewSubTaskText('');
      setIsAddingSubTask(false);
    }
  };

  const subTasks = todo.subTasks || [];
  const hasSubTasks = subTasks.length > 0;
  const completedSubTasks = subTasks.filter(st => st.completed).length;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="p-2 rounded-md bg-muted space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-8"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <TagInput
          selectedTagIds={editTagIds}
          allTags={tags}
          onTagsChange={setEditTagIds}
          onCreateTag={onCreateTag}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted group">
        {isDraggable && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div
          className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${todo.completed ? 'bg-primary border-primary' : 'border-input'}`}
          onClick={() => onToggle(todo)}
        >
          {todo.completed && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
              {todo.text}
            </span>
            {hasSubTasks && (
              <span className="text-xs text-muted-foreground">
                ({completedSubTasks}/{subTasks.length})
              </span>
            )}
            {(hasSubTasks || isAddingSubTask) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 hover:bg-muted-foreground/10 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
          {todoTags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {todoTags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex px-1.5 py-0.5 rounded text-xs text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsAddingSubTask(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add subtask</TooltipContent>
        </Tooltip>
        {onAddToToday && !todo.completed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => onAddToToday(todo)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to today</TooltipContent>
          </Tooltip>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => onDelete(todo.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      {/* Subtasks */}
      {isExpanded && (hasSubTasks || isAddingSubTask) && (
        <div className="ml-8 pl-4 border-l border-muted">
          {subTasks.map(subTask => (
            <div
              key={subTask.id}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted group/subtask"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${subTask.completed ? 'bg-primary border-primary' : 'border-input'}`}
                onClick={() => handleToggleSubTask(subTask.id)}
              >
                {subTask.completed && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
              </div>
              <span className={`flex-1 text-sm ${subTask.completed ? 'line-through text-muted-foreground' : ''}`}>
                {subTask.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover/subtask:opacity-100 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => handleDeleteSubTask(subTask.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {isAddingSubTask && (
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-4 h-4" />
              <Input
                value={newSubTaskText}
                onChange={(e) => setNewSubTaskText(e.target.value)}
                onKeyDown={handleSubTaskKeyDown}
                onBlur={() => {
                  if (!newSubTaskText.trim()) {
                    setIsAddingSubTask(false);
                  }
                }}
                placeholder="Add subtask..."
                autoFocus
                className="h-7 text-sm"
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddSubTask}>
                <Check className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setNewSubTaskText(''); setIsAddingSubTask(false); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
