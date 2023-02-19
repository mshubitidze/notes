import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

const Auth = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  return (
    <div className="flex flex-col gap-2 justify-around items-center py-6 w-3/4 md:justify-center">
      {sessionStatus === "loading" ? (
        <div className="m-8 text-3xl text-white">Loading...</div>
      ) : (
        <>
          {sessionData && (
            <div className="flex flex-row gap-2 justify-center items-center">
              <Image
                width={55}
                height={55}
                src={(sessionData && sessionData.user?.image) || "/favicon.ico"}
                alt="userImg"
                priority
                className="rounded-full"
              />
              <p className="text-2xl text-center text-white">
                <span>{sessionData.user?.name}</span>
              </p>
            </div>
          )}
          <button
            className="py-3 px-10 font-semibold text-white no-underline rounded-full transition ease-in bg-white/10 hover:bg-white/20"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
        </>
      )}
    </div>
  );
};
export default Auth;
