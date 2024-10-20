import * as React from "react";
import { Input, InputProps } from "./input";

type NumberInputProps = Omit<InputProps, "value" | "onChange"> & {
  value?: string | number | null;
  onChange: (value?: string | number) => void;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ onChange, value, inputMode = "decimal", ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    };

    return (
      <Input
        ref={ref}
        type="number"
        value={value === null ? "" : value}
        onChange={handleChange}
        step={inputMode === "decimal" ? "0.01" : "1"}
        min={"0"}
        {...props}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
