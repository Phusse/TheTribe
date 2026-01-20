import React from "react";

interface ChatBubbleProps {
    message: {
        id: number;
        sender: "me" | "them";
        text: string;
        time: string;
    };
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isMe = message.sender === "me";

    return (
        <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`
          max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm leading-relaxed relative
          ${isMe
                        ? "bg-tribe-gold text-black rounded-tr-none"
                        : "bg-white/10 text-white rounded-tl-none"
                    }
        `}
            >
                <p>{message.text}</p>
                <span
                    className={`
            text-[10px] block text-right mt-1 opacity-60
            ${isMe ? "text-black" : "text-white"}
          `}
                >
                    {message.time}
                </span>
            </div>
        </div>
    );
};
