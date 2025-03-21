import { useState, useEffect } from "react";

export const useAccessControl = (userEmail) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      // Allow access if user has an email (is authenticated)
      setIsAllowed(!!userEmail);
      setIsLoading(false);
    };

    checkAccess();
  }, [userEmail]);

  return { isAllowed, isLoading, error };
};
