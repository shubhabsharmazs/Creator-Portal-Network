// src/App.tsx

import React, { useState } from "react";
import { Role } from "./types"; // Get the Role type

// Import the two main application modules
import MSUserApp from "./MSUserApp";
import CreatorApp from "./CreatorApp";

const App: React.FC = () => {
  // Global state to track which portal is currently active
  const [currentRole, setCurrentRole] = useState<Role>("Creator"); // Start with Creator view

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    // Optionally: save role to local storage here
  };

  const renderApp = () => {
    switch (currentRole) {
      case "Creator":
        // Pass the current role and the setter function down
        return (
          <CreatorApp
            initialRole={currentRole}
            onRoleChange={handleRoleChange}
          />
        );
      case "Microsoft User":
      case "Admin":
        // Pass the current role and the setter function down
        return (
          <MSUserApp
            initialRole={currentRole}
            onRoleChange={handleRoleChange}
          />
        );
      default:
        return <div>Invalid Role Selected</div>;
    }
  };

  return <div className="App">{renderApp()}</div>;
};

export default App;
