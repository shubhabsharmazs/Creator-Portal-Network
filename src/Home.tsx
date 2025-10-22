// src/Home.tsx
import React from "react";
import { Role } from "./types";

interface HomeProps {
  onSelectRole: (role: Role) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectRole }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-500 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">
          Welcome to the Creator Network Portal
        </h1>
        <p className="text-lg opacity-90">Choose your role to continue</p>

        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => onSelectRole("Creator")}
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
          >
            Enter Creator Portal
          </button>

          <button
            onClick={() => onSelectRole("Microsoft User")}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
          >
            Enter Microsoft User Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
