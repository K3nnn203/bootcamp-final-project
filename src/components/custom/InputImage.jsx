import { Image } from "lucide-react";
import React, { useRef } from "react";
import { Input } from "@/src/components/ui/input";

export default function InputImage({ onSelect }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    
    if(!file) return;

    onSelect(file)
  };

  return (
    <>
      <button onClick={() => fileInputRef.current?.click()} className="w-7.5 h-7.5 rounded-[50%] hover:bg-muted transition duration-100 ease-in">
        <Image className="m-auto" size={20} strokeWidth={2} />
      </button>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </>
  );
}
