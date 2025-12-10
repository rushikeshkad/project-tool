import { useState, useRef, useEffect } from "react";

export default function MonthYearPicker({ value, onChange }) {
  return (
    <>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-60 px-4 py-2 border-2 border-purple-300 rounded-xl shadow-md bg-white
                   focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   hover:border-purple-400 transition-all duration-300 cursor-pointer
                   text-gray-700 font-medium"
      />
    </>
  );
}