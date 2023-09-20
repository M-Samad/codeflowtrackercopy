import { createContext, useState } from "react";

export const UserContext = createContext(null);

const UserContextProvider = ({ children }) => {

  const [astData, setAstData] = useState({});


  return (
    <UserContext.Provider
      value={{
        astDataState: [astData, setAstData],
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
