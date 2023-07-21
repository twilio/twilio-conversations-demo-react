import React, { Dispatch, SetStateAction } from "react";
import { Label } from "@twilio-paste/label";
import { Input } from "@twilio-paste/input";
import { HelpText } from "@twilio-paste/help-text";
import { Button } from "@twilio-paste/button";
import { HideIcon } from "@twilio-paste/icons/esm/HideIcon";
import { ShowIcon } from "@twilio-paste/icons/esm/ShowIcon";
import { InputType } from "../../types";
import styles from "../../styles";

enum PrefixType {
  SMS = "SMS",
  WhatsApp = "WhatsApp",
}

function getPrefixType(prefixType: string | undefined) {
  switch (prefixType) {
    case PrefixType.SMS:
      return "+";
    case PrefixType.WhatsApp:
      return "WhatsApp +";
    default:
      return undefined;
  }
}

interface ModalInputProps {
  label: string;
  input: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  readonly?: boolean;
  maxLength?: number;
  help_text?: string;
  prefixType?: string;
  inputType?: InputType;
  showPassword?: boolean;
  isFocused?: boolean;
  setShowPassword?: Dispatch<SetStateAction<boolean>>;
  id?: string;
}

const ModalInputField: React.FC<ModalInputProps> = (props: ModalInputProps) => {
  const prefixType = getPrefixType(props.prefixType);

  return (
    <>
      <Label htmlFor="modal-input">
        <div style={styles.modalInputLabel}>{props.label}</div>
      </Label>
      <Input
        id={props.id}
        autoFocus={props.isFocused ?? false}
        type={props.inputType ?? InputType.Text}
        value={props.input}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        readOnly={props.readonly ?? false}
        hasError={!!props.error}
        onBlur={props.onBlur}
        maxLength={props.maxLength}
        insertBefore={prefixType}
        insertAfter={
          props.showPassword !== undefined && (
            <>
              <Button
                variant="link"
                onClick={() => {
                  if (props.setShowPassword !== undefined) {
                    props.setShowPassword(!props.showPassword);
                  }
                }}
              >
                {props.showPassword ? (
                  <ShowIcon
                    decorative={true}
                    size="sizeIcon20"
                    color="colorTextWeak"
                  />
                ) : (
                  <HideIcon
                    decorative={true}
                    size="sizeIcon20"
                    color="colorTextWeak"
                  />
                )}
              </Button>
            </>
          )
        }
      />
      {props.error && (
        <HelpText id="error_help_text" variant="error">
          {props.error}
        </HelpText>
      )}
      {!props.error && props.help_text && (
        <HelpText id="error_help_text">{props.help_text}</HelpText>
      )}
    </>
  );
};

export default ModalInputField;
