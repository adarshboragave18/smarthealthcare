import { useEffect, useRef } from "react";

export default function OtpPinInput({ length = 6, value, onChange, disabled }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    const activeIndex = value.length < length ? value.length : length - 1;
    const nextInput = inputsRef.current[activeIndex];
    nextInput?.focus();
  }, [value, length]);

  function handleChange(index, event) {
    const rawValue = event.target.value.replace(/\D/g, "");
    if (!rawValue) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    const digits = rawValue.split("");
    const nextValue = value.split("");
    nextValue[index] = digits[0];

    for (let offset = 1; offset < digits.length && index + offset < length; offset += 1) {
      nextValue[index + offset] = digits[offset];
    }

    onChange(nextValue.join("").slice(0, length));
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      const previous = inputsRef.current[index - 1];
      previous?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  const digits = Array.from({ length }, (_, index) => value[index] || "");

  return (
    <div className="grid grid-cols-6 gap-3 mt-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="w-full rounded-2xl border border-white/20 bg-white/10 text-center text-2xl font-semibold text-white outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
        />
      ))}
    </div>
  );
}
