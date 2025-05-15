import { Moon, Sun } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useTheme } from '~/components/theme-provider';

export const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="*:w-full *:cursor-pointer" align="end">
        <DropdownMenuItem asChild>
          <button onClick={() => setTheme('light')}>Light</button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button onClick={() => setTheme('dark')}>Dark</button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button onClick={() => setTheme('system')}>System</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
