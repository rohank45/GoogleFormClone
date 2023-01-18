import React, { useState, useEffect } from "react";

const ShowMediaImage = ({ className, image }) => {
  console.log("image", image);
  console.log("typeof image", typeof image);

  const [imageRender, setImageRender] = useState(null);

  useEffect(() => {
    if (typeof image == "object") {
      if (image instanceof Blob) {
        setImageRender(URL.createObjectURL(image));
      } else if (image.target.files && image.target.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
          setImageRender(e.target.result);
        };
        reader.readAsDataURL(image.target.files[0]);
      }
    }

    if (typeof image == "string") {
      setImageRender(image);
    }
  }, [image]);

  return (
    <div>
      {imageRender && (
        <img
          id="target"
          width="150px"
          src={imageRender}
          className={className}
          alt=""
        />
      )}
    </div>
  );
};

export default ShowMediaImage;

// this is how to use this fucnction
{
  /* <ShowMediaImage image={val?.imageUrl} className="border h-40" />; */
}
