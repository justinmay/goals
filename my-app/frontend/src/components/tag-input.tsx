'use client';

import { useState, useRef, useEffect } from 'react';
import { Tag } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

interface TagInputProps {
  selectedTagIds: string[];
  allTags: Tag[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag: (tag: Tag) => Promise<Tag | null>;
}

export function TagInput({ selectedTagIds, allTags, onTagsChange, onCreateTag }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTags = allTags.filter(t => selectedTagIds.includes(t.id));
  
  const filteredTags = allTags.filter(t => 
    !selectedTagIds.includes(t.id) && 
    t.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const canCreate = inputValue.trim() && 
    !allTags.some(t => t.name.toLowerCase() === inputValue.toLowerCase().trim());

  const options = [
    ...filteredTags.map(t => ({ type: 'existing' as const, tag: t })),
    ...(canCreate ? [{ type: 'create' as const, name: inputValue.trim().toLowerCase() }] : []),
  ];

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (option: typeof options[number]) => {
    if (option.type === 'existing') {
      onTagsChange([...selectedTagIds, option.tag.id]);
    } else {
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: option.name,
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
      };
      const created = await onCreateTag(newTag);
      if (created) {
        onTagsChange([...selectedTagIds, created.id]);
      }
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemove = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && options.length > 0) {
      e.preventDefault();
      handleSelect(options[highlightedIndex]);
    } else if (e.key === 'Backspace' && !inputValue && selectedTagIds.length > 0) {
      handleRemove(selectedTagIds[selectedTagIds.length - 1]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 p-1 border rounded-md focus-within:ring-2 focus-within:ring-ring">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <X 
              className="h-3 w-3 cursor-pointer hover:opacity-70" 
              onClick={() => handleRemove(tag.id)} 
            />
          </span>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[100px] border-0 p-1 h-7 focus-visible:ring-0"
        />
      </div>
      
      {showDropdown && options.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto"
        >
          {options.map((option, index) => (
            <div
              key={option.type === 'existing' ? option.tag.id : 'create'}
              className={`px-3 py-2 cursor-pointer ${index === highlightedIndex ? 'bg-accent' : 'hover:bg-accent'}`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.type === 'existing' ? (
                <span className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: option.tag.color }} 
                  />
                  {option.tag.name}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Create &quot;{option.name}&quot;
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
