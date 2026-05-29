import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

const BOT_RESPONSE_MATCHERS = {
  bmi: "chatbot_response_bmi",
  hospital: "chatbot_response_hospital",
  symptom: "chatbot_response_symptom",
  emergency: "chatbot_response_emergency",
  otp: "chatbot_response_otp",
  register: "chatbot_response_register",
  password: "chatbot_response_password",
  checkup: "chatbot_response_checkup",
  dark: "chatbot_response_dark",
  hello: "chatbot_response_hello",
  hi: "chatbot_response_hi",
  help: "chatbot_response_help",
};

function getBotReply(msg, lang) {
  const lower = msg.toLowerCase();
  for (const [key, translationKey] of Object.entries(BOT_RESPONSE_MATCHERS)) {
    if (lower.includes(key)) return t(translationKey, lang);
  }
  return t("chatbot_response_default", lang);
}

export default function Chatbot() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: t("chatbot_greeting", lang) }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(input, lang);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full shadow-2xl shadow-teal-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-all animate-bounce-slow"
        aria-label={t("chatbot_open_button", lang)}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <p className="text-white font-bold text-sm">HealthBot</p>
              <p className="text-teal-100 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" /> {t("chatbot_online", lang)}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm px-4 py-2.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    m.from === "user"
                      ? "bg-teal-500 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("chatbot_placeholder", lang)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={send}
              className="bg-teal-500 hover:bg-teal-600 text-white w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}