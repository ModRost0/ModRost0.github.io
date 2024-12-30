import React, { createContext, useState } from 'react';
import config from '../config';
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, baseUrl: config.BASE_URL, setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
};
