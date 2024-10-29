import CloseModal from "@/components/shared/CloseModal";
import SignIn from "@/components/shared/SignIn";

const page = () => {
  return (
    <div className="dark:bg-primaryDark-900/50 fixed inset-0 z-10 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
      <div className="dark:bg-primaryDark-800 relative w-full max-w-md rounded-lg bg-white px-2 py-20 shadow-xl">
        <div className="absolute right-4 top-4">
          <CloseModal />
        </div>

        <SignIn />
      </div>
    </div>
  );
};

export default page;
