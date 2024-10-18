import * as React from "react";
import type { E164Number } from "libphonenumber-js";
import RPNInput, { type Props, type Value } from "react-phone-number-input";

import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";
import { Flag } from "../icons/flag";
import { COUNTRY_CODE } from "@/lib/constants";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<Props<typeof RPNInput>, "onChange"> & {
    onChange?: (_value: Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => (
      <RPNInput
        ref={ref}
        className={className}
        defaultCountry={COUNTRY_CODE}
        flags={{}}
        countrySelectComponent={() => null}
        inputComponent={InputComponent}
        onChange={(value) => onChange?.((value || "") as E164Number)}
        {...props}
      />
    ),
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <Input className={cn("pl-10", className)} {...props} ref={ref} />
      <Flag className="absolute left-3 top-1/2 size-5 shrink-0 -translate-y-1/2" />
    </div>
  ),
);
InputComponent.displayName = "InputComponent";

export { PhoneInput };
