import { useEffect, useState } from "react";
import {
  Spinner,
  ChatAttachment,
  ChatAttachmentDescription,
  ChatAttachmentLink,
} from "@twilio-paste/core";
import { ReduxMedia } from "../../store/reducers/messageListReducer";
import { DownloadIcon } from "@twilio-paste/icons/cjs/DownloadIcon";

type MessageMediaProps = {
  onDownload: () => Promise<Error | undefined>;
  onOpen: (mediaSid: string, image?: ReduxMedia, file?: ReduxMedia) => void;
  sending?: boolean;
  images: ReduxMedia[];
  files: ReduxMedia[];
  attachments: Record<string, Blob>;
};

const MessageMedia: React.FC<MessageMediaProps> = ({
  onDownload,
  onOpen,
  images,
  files,
  sending,
  attachments,
}: MessageMediaProps) => {
  const [isMediaLoaded, setMediaLoaded] = useState(false);
  useEffect(() => {
    onDownload().then(() => {
      setMediaLoaded(true);
    });
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
      <div>
        {images.map((img) => (
          <div
            key={img.sid}
            style={{
              minHeight: "200px",
              minWidth: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderRadius: "4px",
            }}
            onClick={() => isMediaLoaded && onOpen(img.sid, img)}
          >
            <div
              style={{
                zIndex: 7,
                position: "absolute",
                cursor: "pointer",
              }}
            >
              {sending || !isMediaLoaded ? (
                <Spinner
                  size="sizeIcon60"
                  decorative={false}
                  color="colorTextInverse"
                  title="Loading"
                />
              ) : null}
            </div>
            <img
              style={{
                maxHeight: "300px",
                zIndex: 0,
                maxWidth: "400px",
                width: "100%",
              }}
              src={
                isMediaLoaded
                  ? (window.URL || window.webkitURL).createObjectURL(
                      attachments[img.sid]
                    )
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {files.map((file) => (
        <ChatAttachment
          attachmentIcon={
            !isMediaLoaded || sending ? (
              <Spinner decorative={false} title="Loading" />
            ) : (
              <DownloadIcon decorative />
            )
          }
          key={`${file.filename ?? ""}.index`}
          onClick={() => isMediaLoaded && onOpen(file.sid, undefined, file)}
        >
          <ChatAttachmentLink href="#">
            {file?.filename ?? ""}
          </ChatAttachmentLink>
          <ChatAttachmentDescription>
            {`${Math.round((file.size / Math.pow(2, 20)) * 100) / 100} MB`}
          </ChatAttachmentDescription>
        </ChatAttachment>
      ))}
    </>
  );
};

export default MessageMedia;
