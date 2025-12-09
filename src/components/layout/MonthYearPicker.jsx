import { useState, useRef, useEffect } from "react";

export default function MonthYearPicker({ value, onChange }) {



 return (
    <>
    <input
           type="month"
           value={value}
           onChange={(e) => onChange(e.target.value)}
           className="w-60 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white
                      focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
         />
    </>
 );
}