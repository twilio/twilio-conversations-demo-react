import { useEffect, useState } from "react";
import { Box, Spinner, Text, Truncate } from "@twilio-paste/core";
import { ProductAssetsIcon } from "@twilio-paste/icons/cjs/ProductAssetsIcon";
import { Media } from "@twilio/conversations";
import { ReduxMedia } from "../../store/reducers/messageListReducer";

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
            onClick={() => onOpen(img.sid, img)}
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
      {files.map((file, index) => (
        <Box
          key={String(file.filename) + index}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            marginTop: "6px",
            border: "1px solid #CACDD8",
            boxSizing: "border-box",
            minWidth: "150px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
          onClick={() =>
            isMediaLoaded ? onOpen(file.sid, undefined, file) : null
          }
        >
          <Box
            style={{
              marginRight: "16px",
              alignItems: "start",
            }}
          >
            {!isMediaLoaded || sending ? (
              <Spinner
                decorative={false}
                color="colorTextLink"
                title="Loading"
              />
            ) : (
              <ProductAssetsIcon
                decorative={false}
                title="Open File"
                size="sizeIcon60"
                color="colorTextLink"
                style={{
                  fontWeight: "bold",
                }}
              />
            )}
          </Box>

          <Box
            style={{
              maxWidth: "calc(100% - 42px)",
            }}
          >
            <Text as="p" fontWeight="fontWeightMedium">
              <Truncate title={file.filename ?? ""}>
                {file.filename ?? ""}
              </Truncate>
            </Text>
            {sending || !isMediaLoaded ? (
              <Text as="p" color="colorTextInverseWeaker">
                {!sending || !isMediaLoaded ? "Downloading..." : "Uploading..."}
              </Text>
            ) : (
              <Text as="p" color="colorTextInverseWeaker">
                {Math.round((file.size / Math.pow(2, 20)) * 100) / 100} MB
              </Text>
            )}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default MessageMedia;
