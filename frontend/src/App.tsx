import React from "react";
import { EmailList } from "./components/EmailList";

const App: React.FC = () => {
  return (
    <div className="container">
     <h1 className="centered-heading">📨 One box Email Aggregator</h1>

      <EmailList />
    </div>
  );
};

export default App;
