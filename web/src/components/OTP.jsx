import { useState, useRef } from "react";

export default function OtpInput({ length = 6, onChange, disabled }) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/[^0-9]/.test(value)) return; // allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus(); // move to next box
    }

    onChange(newOtp.join("")); // send combined value
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus(); // go back on delete
    }
  };

  return (
    <div className="flex gap-2">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  );
}
