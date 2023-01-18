import React from "react";

const UnFilledButton = (props) => {
  return (
    <button
      disabled={props?.loading === true ? true : false}
      onClick={props?.onClickUnFilled}
      type={props?.unFilledBtnType}
      className="border border-primary bg-white text-primary rounded-3xl py-1.5 px-5 text-sm font-semibold"
    >
      {props?.loading === true ? "Loading..." : props?.unFilledBtnText}
    </button>
  );
};

export default UnFilledButton;
