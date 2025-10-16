"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchUsers } from "@/lib/user";
import { User } from "@/lib/types";

interface UserSearchProps {
  onUserSelected: (user: User | null) => void;
  value: User | null;
  placeholder?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelected,
  value,
  placeholder = "Search users...",
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

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
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const usernameData = await searchUsers(token, inputValue);
        if (active) {
          setOptions(usernameData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce delay in milliseconds

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

  const handleSelect = (user: User) => {
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
