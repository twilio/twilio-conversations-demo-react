import React from "react";
import { Modal, ModalHeader } from "@twilio-paste/modal";
import { Box, ModalBody, Text } from "@twilio-paste/core";
import {
  MediaBody,
  MediaFigure,
  MediaObject,
} from "@twilio-paste/media-object";
import { Avatar } from "../Avatar";
import { Button } from "@twilio-paste/button";
import { DownloadIcon } from "@twilio-paste/icons/cjs/DownloadIcon";

type ImagePreviewModalProps = {
  image: Blob;
  isOpen: boolean;
  handleClose: () => void;
  onDownload: () => void;
  author: string;
  date: string;
};

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  handleClose,
  author,
  date,
  onDownload,
}: ImagePreviewModalProps) => (
  <Modal
    ariaLabelledby="image-preview"
    isOpen={isOpen}
    onDismiss={handleClose}
    size="default"
  >
    <ModalHeader>
      <Box
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <MediaObject verticalAlign="center">
          <MediaFigure spacing="space40">
            <Avatar size="sizeIcon80" name={author} />
          </MediaFigure>
          <MediaBody>
            <Text as="p" fontSize="fontSize50" lineHeight="lineHeight60">
              {author}
            </Text>
            <Text
              as="p"
              fontSize="fontSize20"
              lineHeight="lineHeight20"
              color="colorTextWeak"
            >
              Sent {date}
            </Text>
          </MediaBody>
        </MediaObject>

        <Button variant="secondary" onClick={onDownload} autoFocus={true}>
          <DownloadIcon
            decorative={false}
            title="Download File"
            size="sizeIcon60"
            color="colorText"
          />
          Download
        </Button>
      </Box>
    </ModalHeader>

    <ModalBody>
      <img
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
        }}
        src={(window.URL || window.webkitURL).createObjectURL(image)}
      />
    </ModalBody>
  </Modal>
);

export default ImagePreviewModal;
