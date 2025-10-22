// src/App.tsx
import React, { useState } from "react";
import { Role } from "./types";
import CreatorApp from "./CreatorApp";
import MSUserApp from "./MSUserApp";
import Home from "./Home";

const App: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (!selectedRole) {
    return <Home onSelectRole={(r) => setSelectedRole(r)} />;
  }

  switch (selectedRole) {
    case "Creator":
      return (
        <CreatorApp initialRole="Creator" onRoleChange={setSelectedRole} />
      );
    case "Microsoft User":
    case "Admin":
      return (
        <MSUserApp
          initialRole="Microsoft User"
          onRoleChange={setSelectedRole}
        />
      );
    default:
      return <Home onSelectRole={(r) => setSelectedRole(r)} />;
  }
};

export default App;
