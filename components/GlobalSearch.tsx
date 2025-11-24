'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import apiClient from '@/lib/axios';

interface Member {
  id: number;
  name: string;
  phoneNumber: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Command+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search members
  useEffect(() => {
    const searchMembers = async () => {
      if (search.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Searching for:', search);
        const response = await apiClient.get(`/admin/members`, {
          params: { search: search, limit: 10, page: 1 }
        });
        console.log('Search response:', response.data);
        setResults(response.data.members || []);
      } catch (error: any) {
        console.error('Search failed:', error);
        console.error('Error details:', error.response?.data);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSelect = (memberId: number) => {
    setOpen(false);
    setSearch('');
    router.push(`/members/${memberId}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4" />
        <span>Search members...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search members by name or phone..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
          <CommandEmpty>
            {isLoading ? 'Searching...' : 'No members found.'}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Members">
              {results.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.id.toString()}
                  onSelect={() => handleSelect(member.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {member.phoneNumber}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
