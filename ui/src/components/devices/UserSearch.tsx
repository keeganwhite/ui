"use client";

import React, { useState, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { UserDetail } from "@/lib/types";
import { searchUsers } from "@/lib/user";
import { cn } from "@/lib/utils";

interface UserSearchProps {
  onUserSelected: (user: UserDetail | null) => void;
  value: UserDetail | null;
  placeholder?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelected,
  value,
  placeholder = "Search user by username...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timerId = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const users = await searchUsers(token, inputValue);
        // Convert User to UserDetail by adding phone_number
        const userDetails: UserDetail[] = users.map((user) => ({
          ...user,
          phone_number: null, // Default to null since User doesn't have phone_number
        }));
        if (active) setOptions(userDetails);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timerId);
      active = false;
    };
  }, [inputValue]);

  // Show username in input if value is set
  useEffect(() => {
    if (value) {
      setInputValue(value.username);
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleSelect = (user: UserDetail) => {
    onUserSelected(user);
    setOpen(false);
    setInputValue(user.username); // Keep the username visible
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (!open) setOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <span className="truncate">{value.username}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 bg-card"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command className="w-full">
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            className="border-0 focus:ring-0"
          />
          <CommandList className="max-h-[200px] overflow-auto">
            {inputValue.length >= 2 && !loading && options.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            )}
            <CommandGroup>
              {options.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.username}
                  onSelect={() => handleSelect(user)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserSearch;
