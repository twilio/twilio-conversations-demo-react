import React from "react";
import { Label } from "@twilio-paste/label";
import { HelpText } from "@twilio-paste/help-text";
import styles from "../../styles";
import { TextArea } from "@twilio-paste/core";

interface ModalTextAreaProps {
  label: string;
  input: string | ReadonlyArray<string> | number | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  readonly?: boolean;
  maxLength?: number;
  help_text?: string;
  isFocused?: boolean;
  id?: string;
}

const ModalTextAreaField: React.FC<ModalTextAreaProps> = (
  props: ModalTextAreaProps
) => {
  return (
    <>
      <Label htmlFor="modal-input">
        <div style={styles.modalInputLabel}>{props.label}</div>
      </Label>
      <TextArea
        id={props.id}
        autoFocus={props.isFocused ?? false}
        value={props.input}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        readOnly={props.readonly ?? false}
        hasError={!!props.error}
        onBlur={props.onBlur}
        maxLength={props.maxLength}
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

export default ModalTextAreaField;
