import protoIcon from "/iconproto.svg";
import plusIcon from "/iconplus.png";
import { useState } from "react";
import ellipsis from "/iconellipsis.svg";
import datasetIcon from "/icondataset.svg";
// import { useCreateAssetMutation } from "@/lib/api/datasets";
import { createAsset } from "@/lib/api/datasets";

export default function ImageRightNav() {
  const [preview, setPreview] = useState<string | null>(null);
  const [showReplace, setShowReplace] = useState(false);

  // const { mutate: createAsset, isPending: isCreateDatasetLoading } =
  //   useCreateAssetMutation();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn("No file selected!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    try {
      const res = await fetch("/api/v0/datasets/upload", {
        method: "POST",
        body: formData, // ✅ DO NOT set Content-Type manually
      });

      const data = await res.json();
      console.log("Upload response:", data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between px-5 py-5 border-b border-b-[#303030]">
        <div>Image properties</div>
        <img src={ellipsis} alt="" className="w-[15px]" />
      </div>
      <div className="">
        <div className="p-3 pb-5">Upload from computer</div>
        {!preview && (
          <div className="w-full h-[200px] bg-[#1C1C1C] flex flex-col">
            <label
              className="cursor-pointer py-3 px-5 bg-[#9253E4] mx-auto mt-20 tracking-[3px] font-semibold rounded-[4px]"
              htmlFor="imageUpload"
            >
              <div className="flex justify-between items-center">
                <div>ADD IMAGE</div>
              </div>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        )}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-auto object-contain z-20"
              onMouseEnter={() => setShowReplace(true)}
              onMouseLeave={() => setShowReplace(false)}
            />
            {showReplace && (
              <label
                className="py-3 px-5 bg-[#9253E4] mx-auto mt-20 tracking-[3px] font-semibold rounded-[4px] absolute top-[10%] left-[10%] z-30"
                htmlFor="imageReplace"
                onMouseEnter={() => setShowReplace(true)}
                onMouseLeave={() => setShowReplace(false)}
              >
                <div className="relative z-30">REPLACE IMAGE</div>
                <input
                  id="imageReplace"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        )}
      </div>
      {/* <div className="p-5 border-b border-b-[#303030]">
        <label className="cursor-pointer" htmlFor="imageUpload">
          <div className="flex justify-between items-center">
            <div>Add more</div>
            <img src={plusIcon} alt="Upload icon" className="py-2" />
          </div>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div> */}
      <div className="p-5">Choose from Dataset</div>
      <div className="mx-2 flex justify-between py-2 px-2 rounded-md bg-[#404040]">
        <div className="flex">
          <img src={datasetIcon} alt="" />
          <p className="px-2">Dataset</p>
        </div>
        <p className="px-2">Fan Data 2024</p>
      </div>
    </div>
  );
}
