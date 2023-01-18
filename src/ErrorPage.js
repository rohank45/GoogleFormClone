import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center">
      <button onClick={() => navigate("/")}>Error Page</button>
    </div>
  );
};

export default ErrorPage;
