import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { FormControl } from "./form";

interface TagInputProps {
  disabled?: boolean;
  value: string[];
  onValueChange: (value: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onValueChange,
  disabled,
}) => {
  const [inputValue, setInputValue] = React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (event.key === "Enter" || event.key === ",") &&
      inputValue.trim() !== ""
    ) {
      event.preventDefault();
      const newKeywords = [...value, inputValue.trim()];
      const uniqueKeywords = newKeywords.filter(
        (item, index) => newKeywords.indexOf(item) === index,
      );
      onValueChange(uniqueKeywords);
      setInputValue("");
    } else if (event.key === "Backspace" && inputValue === "") {
      event.preventDefault();
      const newKeywords = value.slice(0, -1);
      onValueChange(newKeywords);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const paste = event.clipboardData.getData("text");
    const keywordsToAdd = paste
      .split(/[\n\t,]+/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    if (keywordsToAdd.length) {
      const newKeywords = [...value, ...keywordsToAdd];
      const uniqueKeywords = newKeywords.filter(
        (item, index) => newKeywords.indexOf(item) === index,
      );

      onValueChange(uniqueKeywords);
      setInputValue("");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue.trim() !== "" && event.relatedTarget?.tagName !== "BUTTON") {
      const newKeywords = [...value, inputValue.trim()];
      const uniqueKeywords = newKeywords.filter(
        (item, index) => newKeywords.indexOf(item) === index,
      );
      onValueChange(uniqueKeywords);
      setInputValue("");
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = value.filter((_, index) => index !== indexToRemove);
    onValueChange(newKeywords);
    inputRef.current?.focus();
  };

  return (
    <div className="group min-h-10 w-full">
      <div className="z-10 flex min-h-10 w-full flex-wrap items-center rounded-md border bg-accent/50 px-2.5 py-1 transition group-focus-within:border-transparent group-focus-within:ring-2 group-focus-within:ring-ring">
        <div className="flex max-h-[300px] w-full flex-wrap gap-1 overflow-y-auto">
          {value.map((keyword, index) => (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => removeKeyword(index)}
              className="flex items-center rounded-sm bg-foreground/10 px-2 py-1 text-xs disabled:pointer-events-none disabled:opacity-50"
            >
              {keyword}
              <IconX size={14} className="ml-2 cursor-pointer" />
            </button>
          ))}
          <FormControl>
            <input
              type="text"
              ref={inputRef}
              disabled={disabled}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={(e) => handleBlur(e)}
              autoComplete="off"
              placeholder="Add a tag"
              className="my-1 flex-1 bg-transparent pl-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            />
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export { TagInput };
