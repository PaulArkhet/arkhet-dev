import ellipsis from "/iconellipsis.svg";
import triangle from "/icontriangletop.svg";
import toggleOffBright from "/icontoggleoffbright.svg";
import toggleOff from "/icontoggleoff.svg";

export default function InputRightNav() {
    return (
        <div>
            <div className="px-5 py-5 border-b border-b-[#303030]">
                <div className="flex justify-between pb-2">
                    <p className="">Input</p>
                    <img src={ellipsis} alt="" />
                </div>
                <div className="flex py-2 hover:cursor-pointer">
                    <div className="bg-zinc-600 mt-2 mr-2 h-[5px] w-[18px]"></div>
                    <p>Default Input Field</p>
                </div>
            </div>
            <div className="px-5 py-5">
                <div className="py-2 flex">
                    <img src={triangle} className="pr-2" />
                    <div>No Icons</div>
                </div>
                <div className="py-2 flex">
                    <img src={toggleOffBright} className="pr-2" />
                    <div>Label</div>
                </div>
                <div className="py-2 flex">
                    <img src={toggleOffBright} className="pr-2" />
                    <div>Helper Text</div>
                </div>
                <div className="py-2 flex">
                    <img src={toggleOffBright} className="pr-2" />
                    <div>Description</div>
                </div>
                <div className="py-2 flex text-[#666666]">
                    <img src={toggleOff} className="pr-2" />
                    <div>Error</div>
                </div>
                <div className="py-2 flex text-[#666666]">
                    <img src={toggleOff} className="pr-2" />
                    <div>Disabled State</div>
                </div>
            </div>
        </div>
    );
}
