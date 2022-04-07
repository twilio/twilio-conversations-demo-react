import { useEffect, useState } from "react";
import { Box, Button, Spinner, Text, Truncate } from "@twilio-paste/core";
import { ProductAssetsIcon } from "@twilio-paste/icons/cjs/ProductAssetsIcon";
import { CloseIcon } from "@twilio-paste/icons/cjs/CloseIcon";
import { DownloadIcon } from "@twilio-paste/icons/cjs/DownloadIcon";
import { Media } from "@twilio/conversations";

import { getFileUrl } from "../../api";

type MessageFileProps = {
  media: Media | { filename: string; size: number };
  onRemove?: () => void;
  onDownload?: () => void;
  onOpen?: () => void;
  type?: string;
  file?: Blob;
  isImage?: boolean;
  sending?: boolean;
  loading?: boolean;
};

const MessageFile: React.FC<MessageFileProps> = ({
  media,
  onRemove,
  onDownload,
  onOpen,
  type,
  file,
  isImage,
  sending,
  loading = false,
}: MessageFileProps) => {
  const { filename, size } = media;
  const name = filename ?? "";

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!file && isImage && !sending) {
      getFileUrl(media as Media).then((url) => setImageUrl(url));
    }
  }, []);
  if (isImage && type === "view") {
    return (
      <div
        style={{
          minHeight: "200px",
          minWidth: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: "4px",
        }}
        onClick={file ? onOpen : onDownload}
      >
        <div
          style={{
            display: file ? "none" : "block",
            zIndex: 7,
            position: "absolute",
            cursor: "pointer",
          }}
        >
          {sending || loading ? (
            <Spinner
              size="sizeIcon60"
              decorative={false}
              color="colorTextInverse"
              title="Loading"
            />
          ) : (
            <DownloadIcon
              decorative={false}
              title="Download File"
              size="sizeIcon60"
              color="colorTextInverse"
              style={{
                fontWeight: "bold",
              }}
            />
          )}
        </div>
        <img
          style={{
            maxHeight: "300px",
            zIndex: 6,
            maxWidth: "400px",
            filter: !file ? "blur(4px)" : "none",
            width: "100%",
            borderRadius: "4px",
          }}
          src={
            !file
              ? imageUrl
              : (window.URL || window.webkitURL).createObjectURL(file)
          }
        />
      </div>
    );
  } else {
    return (
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          margin: "6px 6px 0 6px",
          border: "1px solid #CACDD8",
          boxSizing: "border-box",
          borderRadius: "4px",
          width: type === "view" ? "calc(100% - 12px)" : "calc(25% - 20px)",
          maxWidth: type === "view" ? "300px" : "200px",
          minWidth: "150px",
          backgroundColor: "#fff",
          cursor: type === "view" ? "pointer" : "default",
        }}
        onClick={type === "view" ? (file ? onOpen : onDownload) : undefined}
      >
        <Box
          style={{
            marginRight: "16px",
            alignItems: "start",
          }}
        >
          {!file && type === "view" ? (
            loading || sending ? (
              <Spinner
                decorative={false}
                color="colorTextLink"
                title="Loading"
              />
            ) : (
              <DownloadIcon
                decorative={false}
                title="Download File"
                size="sizeIcon60"
                color="colorTextLink"
                style={{
                  fontWeight: "bold",
                }}
              />
            )
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
            <Truncate title={name}>{name}</Truncate>
          </Text>
          {loading || sending ? (
            <Text as="p" color="colorTextInverseWeaker">
              {loading ? "Downloading..." : "Uploading..."}
            </Text>
          ) : (
            <Text as="p" color="colorTextInverseWeaker">
              {Math.round((size / Math.pow(2, 20)) * 100) / 100} MB
              {!file && type === "view" ? " - Click to download" : ""}
            </Text>
          )}
        </Box>

        {onRemove ? (
          <Button variant="link" onClick={onRemove}>
            <Box
              style={{
                backgroundColor: "#06033A",
                borderRadius: "10px",
                top: "-45px",
                position: "absolute",
                left: "2%",
              }}
            >
              <CloseIcon
                decorative={false}
                title="Remove file"
                color="colorTextBrandInverse"
              />
            </Box>
          </Button>
        ) : null}
      </Box>
    );
  }
};

export default MessageFile;
