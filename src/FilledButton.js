import React from "react";

const FilledButton = (props) => {
  return (
    <button
      id={props?.id}
      onClick={props?.onClickFilled}
      type={props?.filledBtnType}
      disabled={props?.loading || props?.disabled === true ? true : false}
      className={`border border-primary bg-primary ${
        props?.disabled ? "opacity-50" : "opacity-100"
      } text-white rounded-3xl py-1.5 px-5 
        flex items-center gap-3 mobile:gap-1 text-sm`}
    >
      {props?.filledBtnIcon ? (
        <img src={props?.filledBtnIcon} alt="icon" />
      ) : null}

      {props?.loading === true ? "Loading..." : props?.filledBtnText}
    </button>
  );
};

export default FilledButton;
