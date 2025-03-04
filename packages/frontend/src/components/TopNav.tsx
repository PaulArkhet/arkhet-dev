import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import { User } from "@backend/db/schemas/users";
import { client } from "@/lib/api/client";

export default function TopNav(props: { user: User }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  function toggleUserMenu() {
    setShowUserMenu(!showUserMenu);
  }

  function handleLogout() {
    const result = client.api.v0.auth.logout.$url();
    window.location.href = result.toString();
  }

  return (
    <div className="w-full flex items-center justify-end pr-10 pt-5 z-10">
      <button className="ml-5 w-8 h-8">
        <Avatar className="w-full h-full bg-[#8C7DFF]" onClick={toggleUserMenu}>
          <AvatarImage
            src={
              props.user.profilePictureSrc
                ? props.user.profilePictureSrc
                : "/iconuser.png"
            }
          />
          <AvatarFallback className="text-white">User</AvatarFallback>
        </Avatar>
      </button>
      {showUserMenu && (
        <div className="fixed top-[70px] right-[20px] bg-zinc-700 py-5 px-5 rounded hover:cursor-pointer">
          <button onClick={handleLogout} className="">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
