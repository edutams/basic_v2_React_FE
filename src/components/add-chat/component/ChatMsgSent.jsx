import React, { useContext, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";

import {
  IconPaperclip,
  IconPhoto,
  IconSend,
} from "@tabler/icons-react";
import { ChatContext } from "src/context/ChatContext";

const ChatMsgSent = () => {
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const { sendMessage, selectedChat } = useContext(ChatContext);

  const handleChatMsgChange = (e) => setMsg(e.target.value);

  const onChatMsgSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!msg.trim() || !selectedChat) return;
    sendMessage(selectedChat.id, msg.trim(), "text", []);
    setMsg("");
  };

  // Handle file (non-image) attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedChat) {
      sendMessage(
        selectedChat.id,
        file.name,
        "attachment",
        [
          {
            icon: "icon-url-or-static-path", // You can use a static icon or file type icon
            file: file.name,
            fileSize: `${Math.round(file.size / 1024)} KB`,
          },
        ]
      );
    }
    e.target.value = ""; // Reset input
  };

  // Handle image attachment
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedChat) {
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('Image base64 data:', event.target.result); // Debug log
        sendMessage(
          selectedChat.id,
          event.target.result, // base64 image
          "image",
          []
        );
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ""; // Reset input
  };

  return (
    <Box p={2}>
      <form
        onSubmit={onChatMsgSubmit}
        style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <InputBase
          id="msg-sent"
          fullWidth
          value={msg}
          placeholder="Type a Message"
          size="small"
          type="text"
          inputProps={{ "aria-label": "Type a Message" }}
          onChange={handleChatMsgChange}
        />
        <IconButton
          color="primary"
          onClick={() => imageInputRef.current.click()}
        >
          <IconPhoto stroke={1.5} size="20" />
        </IconButton>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={imageInputRef}
          onChange={handleImageChange}
        />
        <IconButton
          color="primary"
          onClick={() => fileInputRef.current.click()}
        >
          <IconPaperclip stroke={1.5} size="20" />
        </IconButton>
        <input
          type="file"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!msg}
        >
          <IconSend stroke={1.5} size="20" />
        </IconButton>
      </form>
    </Box>
  );
};

export default ChatMsgSent;
