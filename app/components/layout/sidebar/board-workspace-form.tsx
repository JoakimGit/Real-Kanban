import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/utils/cn';
import { useState } from 'react';
import { colorSelections } from '~/utils/constants';
import { Button } from '~/components/ui/button';
import { FormInput, FormSchema } from '~/utils/validation';
import * as v from 'valibot';
import { Spinner } from '~/components/ui/spinner';

interface BoardWorkspaceFormProps {
  initialName?: string;
  initialDescription?: string | null;
  initialColor?: string | null;
  onSubmit: (formData: FormInput) => void;
  children?: React.ReactNode;
  className?: string;
  isPending?: boolean;
}

export const BoardWorkspaceForm = ({
  initialName,
  initialDescription,
  initialColor,
  onSubmit,
  children,
  className,
  isPending,
}: BoardWorkspaceFormProps) => {
  const [name, setName] = useState(initialName ?? '');
  const [description, setDescription] = useState(initialDescription ?? '');
  const [selectedColor, setSelectedColor] = useState(
    initialColor ?? colorSelections[0].value,
  );

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formDataObj = Object.fromEntries(formData.entries());
    formDataObj.color = selectedColor;

    const result = v.safeParse(FormSchema, formDataObj);

    if (result.success) {
      onSubmit(result.output);
    }
  };

  return (
    <form className={cn('space-y-4', className)} onSubmit={handleSubmit}>
      <div>
        <label htmlFor="item-name" className="block mb-1 text-sm">
          Name
        </label>
        <Input
          id="item-name"
          value={name} // Use initialName from props as value
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Name"
          name="name"
        />
      </div>

      <div>
        <label htmlFor="item-description" className="block mb-1 text-sm">
          Description
        </label>
        <Textarea
          id="item-description"
          value={description ?? ''} // Use initialDescription from props as value
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          maxLength={100}
          name="description"
        />
      </div>

      <div className="flex items-center gap-x-2">
        <span>Current color:</span>
        <span className={cn('size-4 rounded', selectedColor)} />
      </div>

      <div className="flex flex-wrap gap-2.5 px-1 pb-2">
        {colorSelections.map((color) => (
          <div
            key={color.value}
            className={cn(
              'color-class size-6 cursor-pointer rounded',
              selectedColor === color.value && 'scale-75',
              color.value,
            )}
            onClick={() => handleColorSelect(color.value)}
          />
        ))}
      </div>

      {children ? (
        children
      ) : (
        <Button type="submit">
          {isPending ? <Spinner className="size-5" /> : 'Save'}
        </Button>
      )}
    </form>
  );
};
