import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/utils/cn';
import { useState } from 'react';
import { availableColorClasses } from '~/utils/constants';
import * as v from 'valibot';
import { Button } from '~/components/ui/button';

const FormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  description: v.optional(v.pipe(v.string(), v.maxLength(100))),
  color: v.optional(v.string()),
});

export type FormInput = v.InferInput<typeof FormSchema>;

interface BoardWorkspaceFormProps {
  initialName?: string;
  initialDescription?: string | null;
  initialColor?: string | null;
  onSubmit: (formData: FormInput) => void;
  children?: React.ReactNode;
}

export const BoardWorkspaceForm = ({
  initialName,
  initialDescription,
  initialColor,
  onSubmit,
  children,
}: BoardWorkspaceFormProps) => {
  const [name, setName] = useState(initialName ?? '');
  const [description, setDescription] = useState(initialDescription ?? '');
  const [selectedColor, setSelectedColor] = useState(
    initialColor ?? availableColorClasses[0],
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
    <form className="space-y-4" onSubmit={handleSubmit}>
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
          className="resize-none"
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(24px,1fr))] gap-2.5 px-1 pb-2">
        {availableColorClasses.map((color) => (
          <div
            key={color}
            className={cn(
              'size-6 cursor-pointer rounded',
              selectedColor === color && 'scale-75',
              color,
            )}
            onClick={() => handleColorSelect(color)}
          />
        ))}
      </div>

      {children ? children : <Button type="submit">Save</Button>}
    </form>
  );
};
