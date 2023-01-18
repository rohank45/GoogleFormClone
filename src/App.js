import React, { useEffect, useRef, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  outlinedInputClasses,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material";
import styled from "@emotion/styled";
import { toast } from "react-toastify";
import { GoPlus } from "react-icons/go";
import Cookies from "universal-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import { EXPRESS_API_BASE_URL } from "../../constant";
// import Editor from "ckeditor5-custom-build/build/ckeditor";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import { usePrompt } from "./UsePrompt";
import FilledButton from "./FilledButton";
import UnFilledButton from "./UnFilledButton";
import Loader from "./Loader";
import { HashLink } from "react-router-hash-link";
// import { ClassicEditor } from "../ckeditor/build/ckeditor";
// import { CKEditor } from "@ckeditor/ckeditor5-react";

// changing border colors for dropdown
const StyledForm = styled("form")(`
  display: flex;
  flex-wrap: wrap;
`);

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: 10,
  width: "100%",
}));
const StyledSelect = styled(Select)(`
  & .${outlinedInputClasses.notchedOutline} {
    border-color: "#006b5c";
  }
  &:hover .${outlinedInputClasses.notchedOutline} {
    border-color: "#006b5c";
  }
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: "#006b5c";
  }
`);

const App = () => {
  const { id } = useParams();
  const cookies = new Cookies();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const optionFileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [isAssignmentDetails, setIsAssignmentDetails] = useState(false);
  const [addQueCounter, setAddQueCounter] = useState(0);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  // const [assignmentCode, setAssignmentCode] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedOptionFile, setSelectedOptionFile] = useState("");
  const [base64Uri, setBase64Uri] = useState("");
  const [que, setQue] = useState("");
  const [marks, setMarks] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [optionType, setOptionType] = useState("");
  const [optionTypeArrs, setOptionTypeArrs] = useState([]);
  const [ansType, setAnsType] = useState("");
  const [codeAnsType, setCodeAnsType] = useState("");
  const [mcqOption, setMcqOption] = useState("");
  const [mcqOptionsArr, setMcqOptionsArr] = useState([]);
  const [checkboxOption, setCheckboxOption] = useState("");
  const [checkboxOptionsArr, setCheckboxOptionsArr] = useState([]);
  const [queArr, setQueArr] = useState([]);
  const [queNewArr, setQueNewArr] = useState();
  const [assignmentLogo, setAssignmentLogo] = useState("");
  const [submittedStatus, setSubmittedStatus] = useState("");
  const [navBlocker, setNavBlocker] = useState(false);
  let token = cookies.get("token");
  let base64Length = 10000;
  let EXPRESS_API_BASE_URL = "";

  // // handle unsaved prompt
  // useEffect(() => {
  //   if (submittedStatus === "SUBMITTED") {
  //     setNavBlocker(false);
  //   } else {
  //     if (
  //       assignmentTitle.length !== 0 ||
  //       assignmentDesc.length !== 0 ||
  //       queArr.length !== 0
  //     ) {
  //       setNavBlocker(true);
  //     } else {
  //       setNavBlocker(false);
  //     }
  //   }
  // }, [submittedStatus, assignmentTitle, assignmentDesc, queArr]);
  // usePrompt("Unsaved changes, are you sure you want to exit?", navBlocker);

  // for dropdown
  const answerTypesArr = [
    {
      value: "MCQ",
      label: "MCQ",
    },
    {
      value: "CHECKBOX",
      label: "CHECKBOX",
    },
    {
      value: "CODE",
      label: "CODE",
    },
    {
      value: "TEXT",
      label: "TEXT",
    },
  ];

  // for dropdown after select ans type
  const codeAnswerTypesArr = [
    {
      value: "HTML",
      label: "HTML",
    },
    {
      value: "PYTHON",
      label: "PYTHON",
    },
    {
      value: "SCRATCH",
      label: "SCRATCH",
    },
  ];

  // for dropdown after select ans type mcq or checkboxes
  const optionsTypeArr = [
    {
      value: "text",
      label: "TEXT",
    },
    {
      value: "image",
      label: "IMAGE",
    },
  ];

  // solved bug related base64
  useEffect(() => {
    if (ansType) {
      setOptionType("");
      setMcqOption("");
      setCheckboxOption("");
      setCorrectOption("");
      setMcqOptionsArr([]);
      setCheckboxOptionsArr([]);
      setOptionTypeArrs([]);
      setSelectedOptionFile("");
    }
  }, [ansType]);

  // converting image to base64
  function getBase64(file, callback) {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => callback(reader.result));
      reader.readAsDataURL(file);
    }
  }

  // using base64 function
  useEffect(() => {
    getBase64(selectedFile, function (base64Data) {
      setBase64Uri(base64Data);
    });
  }, [selectedFile]);

  // handling onchange issues of checkboxes and added validations
  const handleCheckboxOnchange = (e, v) => {
    if (e.target.checked === true) {
      setCorrectOption([...correctOption, v]);
    } else {
      if (Array.isArray(correctOption) === true) {
        const res = correctOption?.filter((val) => val !== v);
        setCorrectOption(res);
      }
    }
  };

  // adding checkbox option to array
  const handleAddCheckboxOption = () => {
    if (ansType === "CHECKBOX" && optionType === "text") {
      const checkOptionLength = checkboxOption.length > 0;
      const checkOptionExits = checkboxOptionsArr?.find(
        (e) => e?.toLowerCase() === checkboxOption?.toLowerCase()
      );

      if (checkOptionExits) {
        toast.warn("Option is already present!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } else if (!checkOptionLength) {
        toast.warn("Option should not be empty!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } else {
        setCheckboxOptionsArr([...checkboxOptionsArr, checkboxOption]);
        setOptionTypeArrs([...optionTypeArrs, optionType]);
        setCheckboxOption("");
      }
    } else {
      if (!selectedOptionFile) {
        toast.warn("Option required!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } else {
        getBase64(selectedOptionFile, function (base64Data) {
          setCheckboxOptionsArr([...checkboxOptionsArr, base64Data]);
        });
        setOptionTypeArrs([...optionTypeArrs, optionType]);
        setCheckboxOption("");
        setSelectedOptionFile("");
      }
    }
  };

  // adding mcq option to array
  const handleAddMcqOption = () => {
    if (ansType === "MCQ" && optionType === "text") {
      const checkOptionLength = mcqOption.length > 0;
      const checkOptionExits = mcqOptionsArr?.find(
        (e) => e?.toLowerCase() === mcqOption?.toLowerCase()
      );

      if (checkOptionExits) {
        toast.warn("Option is already present!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } else if (!checkOptionLength) {
        toast.warn("Option should not be empty!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } else {
        setMcqOptionsArr([...mcqOptionsArr, mcqOption]);
        setOptionTypeArrs([...optionTypeArrs, optionType]);
        setMcqOption("");
      }
    } else {
      if (!selectedOptionFile) {
        toast.warn("Option required!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } else {
        getBase64(selectedOptionFile, function (base64Data) {
          setMcqOptionsArr([...mcqOptionsArr, base64Data]);
        });
        setOptionTypeArrs([...optionTypeArrs, optionType]);
        setMcqOption("");
        setSelectedOptionFile("");
      }
    }
  };

  // adding que to array
  const handleAddQue = () => {
    const checkQueLength = que.length > 10;
    const checkQueExits = queArr?.find(
      (e) => e.text?.toLowerCase() === que?.toLowerCase()
    );
    const checkCheckBoxOptionsArrLength = checkboxOptionsArr.length < 2;
    const checkMcqOptionsArrLength = mcqOptionsArr.length < 2;

    if (checkQueExits) {
      toast.warn("Question is already present!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (!checkQueLength) {
      toast.warn("Question should have minimum 10 characters!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (!marks) {
      toast.warn("Marks required!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (parseInt(marks) === 0 || marks.length > 2) {
      toast.warn("Valid Marks required!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (!ansType) {
      toast.warn("Answer type required!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (ansType === "CHECKBOX" && checkCheckBoxOptionsArrLength) {
      toast.warn("Please add atleast 2 options!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (ansType === "MCQ" && checkMcqOptionsArrLength) {
      toast.warn("Please add atleast 2 options!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (
      (ansType === "MCQ" || ansType === "CHECKBOX") &&
      correctOption.length === 0
    ) {
      toast.warn("Please select correct option!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else {
      setQueArr([
        ...queArr,
        {
          id: uuidv4(),
          text: que,
          maxScore: parseInt(marks),
          type: ansType,
          optionTypes: optionTypeArrs,
          options: ansType === "MCQ" ? mcqOptionsArr : checkboxOptionsArr,
          answerFormat: ansType === "CODE" ? codeAnsType : "TEXT",
          correctOption: correctOption,
        },
      ]);

      setQue("");
      setMarks("");
      setAnsType("");
      setOptionType("");
      setMcqOption("");
      setMcqOptionsArr([]);
      setCheckboxOption("");
      setCheckboxOptionsArr([]);
      setOptionTypeArrs([]);
      setCodeAnsType("");
      setCorrectOption("");

      toast.success("Question added successfully!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  // removing que from array
  const handleRemoveQue = (index) => {
    let newCounterValue = addQueCounter;
    setQueArr(queArr?.filter((val) => val.id !== index));

    setAddQueCounter(0);
    setTimeout(() => {
      setAddQueCounter(newCounterValue);
    }, 200);
  };

  // get data to prefill
  const getAssignmentDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${EXPRESS_API_BASE_URL}/assignment/${parseInt(id)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.data && id) {
        setIsAssignmentDetails(true);
        setAssignmentTitle(res.data.data?.title);
        setAssignmentDesc(res.data.data?.description);
        setAssignmentLogo(res.data.data?.featureImage);
        setSubmittedStatus(res.data.data?.submittedStatus);

        let sArr = [];
        for (let si = 0; si < res.data.data?.Question.length; si++) {
          const se = res.data.data?.Question[si];

          sArr.push({
            answerFormat: se.answerFormat,
            assignmentId: se.assignmentId,
            correctOption: se.correctOption,
            id: se.id,
            maxScore: se.maxScore,
            optionTypes: se.optionTypes,
            options: se.options,
            text: se.text,
            type: se.type,
          });
        }

        setQueArr(sArr);
      }
      // console.log("getAssignmentDetails res", res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setIsAssignmentDetails(false);
      console.log("getAssignmentDetails error", error);
    }
  };

  useEffect(() => {
    if (id) {
      getAssignmentDetails();
    }
  }, [id]);

  // prefilling data need to edit
  const handleEditQue = (index) => {
    setNavBlocker(false);
    let res = queArr?.find((val) => val.id === index);
    // console.log("edit btn clicked", res);

    setQue(res?.text);
    setMarks(res?.maxScore);
    setCorrectOption(res?.correctOption);
    setOptionType(res?.type);
    setOptionTypeArrs(res?.optionTypes);
    setAnsType(res?.type);
    setCodeAnsType(res?.answerFormat);
    setMcqOptionsArr(res?.options);
    setCheckboxOptionsArr(res?.options);
    setQueArr(queArr?.filter((val) => val.id !== index));
  };

  // updating base64 value
  useEffect(() => {
    if (queArr) {
      let newArray = [];

      for (let i = 0; i < queArr.length; i++) {
        const element = queArr[i];

        // for correctOption
        let newCorrectOption = "";
        let newCorrectOptionArr = [];

        if (element && element?.answerFormat === "TEXT") {
          if (element?.type === "CHECKBOX") {
            // checkbox correctOption
            if (Array.isArray(element?.correctOption)) {
              for (
                let index = 0;
                index < element.correctOption.length;
                index++
              ) {
                const nelements = element.correctOption[index];

                if (nelements) {
                  if (nelements?.length > base64Length) {
                    let newBase64 = nelements?.split(",");
                    newCorrectOptionArr.push(newBase64[1]);
                  } else {
                    newCorrectOptionArr.push(nelements);
                  }
                }
              }
            } else {
              newCorrectOption = element?.correctOption;
            }
          } else {
            // mcq correctOption
            if (element?.correctOption?.length > base64Length) {
              let newBase64 = element?.correctOption?.split(",");
              newCorrectOption = newBase64[1];
            } else {
              newCorrectOption = element?.correctOption;
            }
          }
        }

        // for options
        let newOptionArrExtra = [];
        for (let index = 0; index < element.options.length; index++) {
          const newelement = element.options[index];

          if (newelement && newelement.length > base64Length) {
            let newBase64 = newelement?.split(",");
            newOptionArrExtra.push(newBase64[1]);
          } else {
            newOptionArrExtra.push(newelement);
          }
        }

        newArray.push({
          answerFormat: element.answerFormat,
          correctOption:
            newCorrectOptionArr.length > 0
              ? newCorrectOptionArr?.join()
              : newCorrectOption,
          id: element.id,
          maxScore: element.maxScore,
          options: newOptionArrExtra,
          optionTypes: element.optionTypes,
          text: element.text,
          type: element.type,
        });
      }
      setQueNewArr(newArray);
    }
  }, [queArr]);

  // create assignment with quetions api integration
  const onCreate = async () => {
    let newBase64 = base64Uri?.split(",");
    let newFeatureImg = newBase64[1];
    const checkTitleLength = assignmentTitle?.length > 5;

    // auto-generate Assignment Code
    let finalAssignmentCode = assignmentTitle.trim();
    let randomThreeDigitNo = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    let APIfinalAssignmentCode =
      finalAssignmentCode.toLowerCase() + "_" + randomThreeDigitNo;

    if (!checkTitleLength) {
      toast.warn("Title should contain minimum 5 characters!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
    // else if (!assignmentDesc) {
    //   toast.warn("Assignment description required!", {
    //     position: toast.POSITION.TOP_CENTER,
    //     autoClose: 3000,
    //   });
    // }
    else if (queNewArr.length === 0) {
      toast.warn("Add atleast one question!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else {
      try {
        setNavBlocker(false);
        setLoading(true);
        // removing id while saving assignment
        for (let index = 0; index < queNewArr.length; index++) {
          delete queNewArr[index]["id"];
        }

        if (newFeatureImg) {
          await axios.post(
            `${EXPRESS_API_BASE_URL}/assignment/`,
            {
              title: assignmentTitle,
              description: assignmentDesc,
              assignmentCode: APIfinalAssignmentCode?.replace(/ /g, ""),
              questions: queNewArr, // queNewArr
              featureImage: newFeatureImg,
              featureImageExtension: "png",
              contentType: "image/png",
              submittedStatus: "DRAFT",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${EXPRESS_API_BASE_URL}/assignment/`,
            {
              title: assignmentTitle,
              description: assignmentDesc,
              assignmentCode: APIfinalAssignmentCode?.replace(/ /g, ""),
              questions: queNewArr, // queNewArr
              submittedStatus: "DRAFT",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        navigate("/assignments");
        toast.success("Assignment created successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("create assignments error", error);
      }
    }
  };

  // saved as draft assignment with quetions api integration
  const onSaveAsDraft = async () => {
    let newBase64 = base64Uri?.split(",");
    let newFeatureImg = newBase64[1];
    const checkTitleLength = assignmentTitle?.length > 5;

    // auto-generate Assignment Code
    let finalAssignmentCode = assignmentTitle.trim();
    let randomThreeDigitNo = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    let APIfinalAssignmentCode =
      finalAssignmentCode.toLowerCase() + "_" + randomThreeDigitNo;

    if (!checkTitleLength) {
      toast.warn("Assignment title should contain minimum 5 characters!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (!assignmentDesc) {
      toast.warn("Assignment description required!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (queNewArr.length === 0) {
      toast.warn("Add atleast one question!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else {
      try {
        setNavBlocker(false);
        setLoading(true);
        // removing id while saving assignment
        for (let index = 0; index < queNewArr.length; index++) {
          delete queNewArr[index]["id"];
        }

        if (newFeatureImg || assignmentLogo) {
          await axios.put(
            `${EXPRESS_API_BASE_URL}/assignment/${id}`,
            {
              title: assignmentTitle,
              description: assignmentDesc,
              assignmentCode: APIfinalAssignmentCode?.replace(/ /g, ""),
              questions: queNewArr,
              featureImage: newFeatureImg ? newFeatureImg : assignmentLogo,
              featureImageExtension: "png",
              contentType: "image/png",
              submittedStatus: "DRAFT",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.put(
            `${EXPRESS_API_BASE_URL}/assignment/${id}`,
            {
              title: assignmentTitle,
              description: assignmentDesc,
              assignmentCode: APIfinalAssignmentCode?.replace(/ /g, ""),
              questions: queNewArr,
              submittedStatus: "DRAFT",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        navigate("/assignments");
        toast.success("Assignment saved as draft!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("saved as draft assignments error", error);
      }
    }
  };

  // publish assignment with quetions api integration
  const onPublish = async () => {
    let newBase64 = base64Uri?.split(",");
    let newFeatureImg = newBase64[1];
    const checkTitleLength = assignmentTitle?.length > 5;

    // auto-generate Assignment Code
    let finalAssignmentCode = assignmentTitle.trim();
    let randomThreeDigitNo = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    let APIfinalAssignmentCode =
      finalAssignmentCode.toLowerCase() + "_" + randomThreeDigitNo;

    if (!checkTitleLength) {
      toast.warn("Assignment title should contain minimum 5 characters!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (!assignmentDesc) {
      toast.warn("Assignment description required!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else if (queNewArr.length === 0) {
      toast.warn("Add atleast one question!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } else {
      try {
        setNavBlocker(false);
        setLoading(true);
        // removing id while saving assignment
        for (let index = 0; index < queNewArr.length; index++) {
          delete queNewArr[index]["id"];
        }

        if (newFeatureImg || assignmentLogo) {
          await axios.put(
            `${EXPRESS_API_BASE_URL}/assignment/${id}`,
            {
              title: assignmentTitle,
              description: assignmentDesc,
              assignmentCode: APIfinalAssignmentCode?.replace(/ /g, ""),
              questions: queNewArr,
              featureImage: newFeatureImg ? newFeatureImg : assignmentLogo,
              featureImageExtension: "png",
              contentType: "image/png",
              submittedStatus: "SUBMITTED",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.put(
            `${EXPRESS_API_BASE_URL}/assignment/${id}`,
            {
              title: assignmentTitle,
              description: assignmentDesc,
              assignmentCode: APIfinalAssignmentCode?.replace(/ /g, ""),
              questions: queNewArr,
              submittedStatus: "SUBMITTED",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        navigate("/assignments");
        toast.success("Assignment published successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("publish assignments error", error);
      }
    }
  };

  return (
    <>
      {loading === true ? (
        <Loader />
      ) : (
        <div className="w-4/5 mobile:w-full ipad:w-full position-class pb-10">
          <div className="bg-secondary flex justify-between items-center p-5 stickyNavbar z-40 mobile:flex-col">
            <p className="text-2xl font-semibold">
              {isAssignmentDetails ? "Edit Assignment" : "Google Form Clone"}
            </p>

            {submittedStatus === "SUBMITTED" ? (
              <></>
            ) : id ? (
              <div className="flex gap-5 mobile:mt-5 mobile:justify-center">
                <UnFilledButton
                  onClickUnFilled={(e) => onSaveAsDraft()}
                  unFilledBtnText="Save as draft"
                  loading={loading}
                />
                <FilledButton
                  onClickFilled={(e) => onPublish()}
                  filledBtnText="Publish"
                  loading={loading}
                />
              </div>
            ) : (
              <FilledButton
                onClickFilled={(e) => onCreate()}
                filledBtnText="Create"
                loading={loading}
              />
            )}
          </div>

          <div className="w-3/4 laptop:w-4/5 ipad:w-full mobile:w-full my-5 ipad:mx-auto mobile:mx-auto">
            <div className="px-5">
              <div className="border border-primary rounded-md p-2 bg-secondary">
                <div className="my-2 w-full">
                  <TextField
                    style={{ width: "100%" }}
                    id="outlined-multiline-flexible"
                    label="Title *"
                    disabled={submittedStatus === "SUBMITTED" ? true : false}
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                  />
                </div>

                <div className="my-3" id="create-question">
                  {/* <p className="text-primary text-lg font-semibold m-2 mobile:text-xs">
                    Assignment Description *
                  </p> */}

                  {/* <CKEditor
                    editor={ClassicEditor}
                    // data="<p>Hello from CKEditor 5!</p>"
                    onReady={(editor) => {
                      console.log("Editor is ready to use!", editor);
                    }}
                    data={assignmentDesc}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setAssignmentDesc(data);
                      // console.log("data", event);
                      // console.log("data", editor);
                      // console.log("data", data);
                    }}
                    disabled={submittedStatus === "SUBMITTED" ? true : false}
                    config={{
                      // toolbar: [],
                      isReadOnly:
                        submittedStatus === "SUBMITTED" ? true : false,
                    }}
                    onBlur={(event, editor) => {
                      // console.log("Blur.", editor);
                    }}
                    onFocus={(event, editor) => {
                      // console.log("Focus.", editor);
                    }}
                  /> */}
                </div>

                <div className="my-3 flex items-center flex-wrap gap-2 border border-gray-300 px-2 py-3 rounded-md">
                  <p className="font-semibold text-lg mobile:text-xs text-primary">
                    Upload logo:
                  </p>

                  <div>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      disabled={submittedStatus === "SUBMITTED" ? true : false}
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <FilledButton
                      onClickFilled={() => fileInputRef.current.click()}
                      filledBtnText="select"
                      loading={loading}
                      disabled={submittedStatus === "SUBMITTED" ? true : false}
                    />
                  </div>

                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt={"assignment graphic"}
                      height="200px"
                      width={"200px"}
                    />
                  ) : assignmentLogo ? (
                    <img
                      src={assignmentLogo}
                      alt={"assignment graphic"}
                      height="200px"
                      width={"200px"}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>

              {submittedStatus === "SUBMITTED" ? (
                <></>
              ) : (
                <div className="border border-primary rounded-md p-2 mt-6 relative">
                  <div className="mb-3 w-full">
                    {/* <p className="text-primary text-xl font-semibold m-2 mobile:text-xs">
                      Question *
                    </p> */}

                    {/* <CKEditor
                      editor={Editor}
                      data={que}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setQue(data);
                      }}
                      disabled={submittedStatus === "SUBMITTED" ? true : false}
                      config={{
                        isReadOnly:
                          submittedStatus === "SUBMITTED" ? true : false,
                        // plugins: [ImageInsert],
                        // toolbar: ["insertImage"],
                      }}
                    /> */}
                  </div>

                  <div className="mb-3 w-full">
                    <TextField
                      style={{ width: "100%" }}
                      id="outlined-multiline-flexible"
                      label="Question *"
                      type="text"
                      value={que}
                      onChange={(e) => setQue(e.target.value)}
                    />
                  </div>

                  <div className="mb-1 w-full">
                    <TextField
                      style={{ width: "100%" }}
                      id="outlined-multiline-flexible"
                      label="Marks *"
                      type="number"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                    />
                  </div>

                  <div className="">
                    <StyledForm autoComplete="off">
                      <StyledFormControl variant="outlined">
                        <InputLabel
                          id="outlined-age-simple-label"
                          sx={{
                            color: "#006b5c",
                          }}
                        >
                          Select Type *
                        </InputLabel>
                        <StyledSelect
                          sx={{
                            color: "#006b5c",
                          }}
                          variant="outlined"
                          label="Select Type *"
                          value={ansType}
                          onChange={(e) => setAnsType(e.target.value)}
                        >
                          {answerTypesArr?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      </StyledFormControl>
                    </StyledForm>
                  </div>

                  {ansType === "MCQ" || ansType === "CHECKBOX" ? (
                    <div className="mt-1">
                      <StyledForm autoComplete="off">
                        <StyledFormControl variant="outlined">
                          <InputLabel
                            id="outlined-age-simple-label"
                            sx={{
                              color: "#006b5c",
                            }}
                          >
                            Select Type *
                          </InputLabel>
                          <StyledSelect
                            sx={{
                              color: "#006b5c",
                            }}
                            // disabled={optionType ? true : false}
                            variant="outlined"
                            label="Select Type *"
                            value={optionType}
                            onChange={(e) => setOptionType(e.target.value)}
                          >
                            {optionsTypeArr?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledFormControl>
                      </StyledForm>
                    </div>
                  ) : (
                    ""
                  )}

                  {ansType === "MCQ" && (
                    <div>
                      {optionType === "image" ? (
                        <div className="mt-2">
                          <div className="w-full my-4 flex justify-between items-center gap-2 border border-gray-300 px-2 py-3 rounded-md">
                            <div className="flex items-center flex-wrap w-full">
                              <p className="font-semibold text-lg mobile:text-xs">
                                Upload option :{" "}
                              </p>

                              <div className="mx-3 mobile:my-3">
                                <input
                                  type="file"
                                  className="hidden"
                                  ref={optionFileInputRef}
                                  disabled={
                                    submittedStatus === "SUBMITTED"
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    setSelectedOptionFile(e.target.files[0])
                                  }
                                />
                                <FilledButton
                                  onClickFilled={() =>
                                    optionFileInputRef.current.click()
                                  }
                                  filledBtnText="Upload Image"
                                  loading={loading}
                                  disabled={
                                    submittedStatus === "SUBMITTED"
                                      ? true
                                      : false
                                  }
                                />
                              </div>

                              {selectedOptionFile && (
                                <img
                                  src={URL.createObjectURL(selectedOptionFile)}
                                  alt={"assignment graphic"}
                                  height="200px"
                                  width={"200px"}
                                />
                              )}
                            </div>

                            <button
                              onClick={handleAddMcqOption}
                              className="border rounded-full p-1 bg-primary z-10"
                            >
                              <GoPlus className="text-white text-lg" />
                            </button>
                          </div>
                        </div>
                      ) : optionType === "text" ? (
                        <div className="mt-2">
                          <div className="flex items-center justify-between my-5">
                            <input
                              type="text"
                              style={{ width: "95%" }}
                              placeholder="add option"
                              value={mcqOption}
                              onChange={(e) => setMcqOption(e.target.value)}
                              className="outline-none px-2 ml-1 text-primary border-b border-primary"
                            />

                            <button
                              onClick={handleAddMcqOption}
                              className="border rounded-full p-1 bg-primary z-10"
                            >
                              <GoPlus className="text-white text-lg" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}

                      {correctOption && correctOption.length > base64Length ? (
                        <div className="my-2 w-full border-b">
                          <p className="font-semibold text-lg pb-2 text-gray-600">
                            Correct Option:{" "}
                            <img
                              className="border"
                              // src={URL.createObjectURL(correctOption)}
                              src={correctOption}
                              alt={"uploaded option"}
                              height="200px"
                              width={"200px"}
                            />
                          </p>
                        </div>
                      ) : (
                        <></>
                      )}

                      {optionTypeArrs &&
                        optionTypeArrs?.map((xs, indes) =>
                          xs === "image" ? (
                            <div>
                              <RadioGroup
                                value={correctOption}
                                onChange={(e, i) => {
                                  if (!isNaN(e.target.value)) {
                                    setCorrectOption(
                                      mcqOptionsArr[parseInt(e.target.value)]
                                    );
                                  }
                                }}
                                name="picked"
                              >
                                {mcqOptionsArr && mcqOptionsArr[indes] && (
                                  <div key={indes}>
                                    <FormControlLabel
                                      control={
                                        <Radio
                                          sx={{
                                            "&, &.Mui-checked": {
                                              color: "#006b5c",
                                            },
                                            color: "#006b5c",
                                          }}
                                          value={indes}
                                        />
                                      }
                                      label={
                                        <img
                                          className="border mt-2"
                                          // src={URL.createObjectURL(v)}
                                          src={mcqOptionsArr[indes]}
                                          alt={"uploaded option"}
                                          height="200px"
                                          width={"200px"}
                                        />
                                      }
                                    />
                                  </div>
                                )}
                              </RadioGroup>
                            </div>
                          ) : (
                            <RadioGroup
                              value={correctOption}
                              onChange={(e) => {
                                setCorrectOption(e.target.value);
                              }}
                              name="picked"
                            >
                              {mcqOptionsArr && mcqOptionsArr[indes] && (
                                <div key={indes}>
                                  <FormControlLabel
                                    control={
                                      <Radio
                                        sx={{
                                          "&, &.Mui-checked": {
                                            color: "#006b5c",
                                          },
                                          color: "#006b5c",
                                        }}
                                        value={mcqOptionsArr[indes]}
                                      />
                                    }
                                    label={mcqOptionsArr[indes]}
                                  />
                                </div>
                              )}
                            </RadioGroup>
                          )
                        )}
                    </div>
                  )}

                  {ansType === "CHECKBOX" && (
                    <div>
                      {optionType === "image" ? (
                        <div className="mt-3">
                          <div className="w-full my-4 flex justify-between items-center gap-2 border border-gray-300 px-2 py-3 rounded-md">
                            <div className="flex items-center flex-wrap w-full">
                              <p className="font-semibold text-lg mobile:text-xs">
                                Upload option :{" "}
                              </p>

                              <div className="mx-3 mobile:my-3">
                                <input
                                  type="file"
                                  className="hidden"
                                  ref={optionFileInputRef}
                                  disabled={
                                    submittedStatus === "SUBMITTED"
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    setSelectedOptionFile(e.target.files[0])
                                  }
                                />
                                <FilledButton
                                  onClickFilled={() =>
                                    optionFileInputRef.current.click()
                                  }
                                  filledBtnText="Upload Image"
                                  loading={loading}
                                  disabled={
                                    submittedStatus === "SUBMITTED"
                                      ? true
                                      : false
                                  }
                                />
                              </div>

                              {selectedOptionFile && (
                                <img
                                  src={URL.createObjectURL(selectedOptionFile)}
                                  alt={"assignment graphic"}
                                  height="200px"
                                  width={"200px"}
                                />
                              )}
                            </div>

                            <button
                              onClick={handleAddCheckboxOption}
                              className="border rounded-full p-1 bg-primary z-10"
                            >
                              <GoPlus className="text-white text-lg" />
                            </button>
                          </div>
                        </div>
                      ) : optionType === "text" ? (
                        <div className="mt-3">
                          <div className="flex items-center justify-between my-5">
                            <input
                              type="text"
                              style={{ width: "95%" }}
                              placeholder="add option"
                              value={checkboxOption}
                              onChange={(e) =>
                                setCheckboxOption(e.target.value)
                              }
                              className="outline-none px-2 ml-1 text-primary border-b border-primary"
                            />

                            <button
                              onClick={handleAddCheckboxOption}
                              className="border rounded-full p-1 bg-primary z-10"
                            >
                              <GoPlus className="text-white text-lg" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}

                      {optionTypeArrs &&
                        optionTypeArrs?.map((xs, indes) =>
                          xs === "image" ? (
                            <div>
                              {checkboxOptionsArr &&
                                checkboxOptionsArr[indes] && (
                                  <div key={indes}>
                                    <FormGroup>
                                      <div className="flex items-center my-7 laptop:my-4 ipad:my-2 mobile:my-2">
                                        <div className="w-full flex items-center">
                                          <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                            <div>
                                              <FormControlLabel
                                                label={
                                                  <img
                                                    className="border"
                                                    // src={URL.createObjectURL(v)}
                                                    src={
                                                      checkboxOptionsArr[indes]
                                                    }
                                                    alt={"uploaded option"}
                                                    height="200px"
                                                    width={"200px"}
                                                  />
                                                }
                                                control={
                                                  <Checkbox
                                                    sx={{
                                                      color: "#006b5c",
                                                      "&.Mui-checked": {
                                                        color: "#006b5c",
                                                      },
                                                    }}
                                                    name="checked"
                                                    value={
                                                      checkboxOptionsArr[indes]
                                                    }
                                                    onChange={(e) => {
                                                      handleCheckboxOnchange(
                                                        e,
                                                        checkboxOptionsArr[
                                                          indes
                                                        ]
                                                      );
                                                    }}
                                                  />
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </FormGroup>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div>
                              {checkboxOptionsArr &&
                                checkboxOptionsArr[indes] && (
                                  <div key={indes}>
                                    <FormGroup>
                                      <div className="flex items-center mb-3">
                                        <div className="w-full flex items-center">
                                          <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                            <div>
                                              <FormControlLabel
                                                label={
                                                  checkboxOptionsArr[indes]
                                                }
                                                control={
                                                  <Checkbox
                                                    sx={{
                                                      color: "#006b5c",
                                                      "&.Mui-checked": {
                                                        color: "#006b5c",
                                                      },
                                                    }}
                                                    name="checked"
                                                    value={
                                                      checkboxOptionsArr[indes]
                                                    }
                                                    onChange={(e) => {
                                                      handleCheckboxOnchange(
                                                        e,
                                                        checkboxOptionsArr[
                                                          indes
                                                        ]
                                                      );
                                                    }}
                                                  />
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </FormGroup>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                    </div>
                  )}

                  {ansType === "CODE" ? (
                    <div className="mt-1">
                      <StyledForm autoComplete="off">
                        <StyledFormControl variant="outlined">
                          <InputLabel
                            id="outlined-age-simple-label"
                            sx={{
                              color: "#006b5c",
                            }}
                          >
                            Select Type *
                          </InputLabel>
                          <StyledSelect
                            sx={{
                              color: "#006b5c",
                            }}
                            variant="outlined"
                            label="Select Type *"
                            value={codeAnsType}
                            onChange={(e) => setCodeAnsType(e.target.value)}
                          >
                            {codeAnswerTypesArr?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option?.label}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledFormControl>
                      </StyledForm>
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="mt-5 mb-2 w-full flex justify-center items-center">
                    <button
                      onClick={handleAddQue}
                      className="border border-primary bg-primary text-white text-center rounded-xl py-2 w-full"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              )}

              {queArr?.map((c, index) => {
                return (
                  <div
                    className="border border-primary rounded-md p-2 mt-5 relative"
                    key={index}
                  >
                    {submittedStatus === "SUBMITTED" ? (
                      <></>
                    ) : (
                      <div className="absolute -right-3 -top-3 flex gap-4">
                        <HashLink
                          smooth
                          to={`/assignment/builder/${parseInt(
                            id
                          )}/#create-question`}
                        >
                          <button
                            onClick={() => handleEditQue(queArr[index]?.id)}
                            className="border rounded-full p-1 bg-blue-600 z-10"
                          >
                            <AiOutlineEdit className="text-white text-lg" />
                          </button>
                        </HashLink>

                        <button
                          onClick={() => handleRemoveQue(queArr[index]?.id)}
                          className="border rounded-full p-1 bg-red-500 z-10"
                        >
                          <RiDeleteBin6Line className="text-white text-lg" />
                        </button>
                      </div>
                    )}

                    <div className="my-2 w-full flex items-center gap-3">
                      <p className="font-semibold text-lg text-gray-600">
                        Q.{index + 1}
                      </p>

                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{
                          __html: c?.text,
                        }}
                      >
                        {/* <CKEditor
                          editor={ClassicEditor}
                          data={c?.text}
                          disabled={true}
                          config={{
                            toolbar: [],
                            isReadOnly: true,
                          }}
                        /> */}
                      </div>
                    </div>

                    <div className="my-2 w-full">
                      <p className="font-semibold text-lg pb-2 text-gray-600">
                        Marks:{" "}
                        <span className="font-normal text-gray-600">
                          {c?.maxScore}
                        </span>
                      </p>
                    </div>

                    <div className="my-2 w-full">
                      <p className="font-semibold text-lg pb-2 text-gray-600">
                        Answer Type:{" "}
                        <span className="font-normal text-gray-600">
                          {c?.type}
                        </span>
                      </p>
                    </div>

                    {queArr[index]?.type === "MCQ" ? (
                      <div className="mt-3">
                        <div className="my-2 w-full border-b">
                          <p className="font-semibold text-lg pb-2 text-gray-600">
                            Correct Option:{" "}
                            {c?.correctOption &&
                            c?.correctOption?.length > base64Length ? (
                              <img
                                className="border"
                                src={
                                  c?.correctOption?.length > base64Length
                                    ? c?.correctOption.includes(
                                        "data:image/png;base64,"
                                      )
                                      ? c?.correctOption
                                      : `data:image/png;base64,${c?.correctOption}`
                                    : c?.correctOption
                                }
                                alt={"uploaded option"}
                                height="200px"
                                width={"200px"}
                              />
                            ) : (
                              <span className="font-normal text-gray-600">
                                {c?.correctOption}
                              </span>
                            )}
                          </p>
                        </div>

                        <p className="font-semibold text-lg pb-2 text-gray-600">
                          Options:
                        </p>

                        {c?.optionTypes?.map((vsa, ina) =>
                          vsa === "text"
                            ? c?.options &&
                              c?.options[ina] && (
                                <div key={ina} className="flex mb-3 gap-2">
                                  <span>{ina + 1}.</span>
                                  <input
                                    type="text"
                                    style={{ width: "92%" }}
                                    placeholder="add option"
                                    disabled={true}
                                    value={c?.options[ina]}
                                    readOnly={true}
                                    className="outline-none px-2 text-primary border-b border-primary"
                                  />
                                </div>
                              )
                            : c?.options &&
                              c?.options[ina] && (
                                <div key={ina} className="flex mb-3 gap-2">
                                  <span>{ina + 1}.</span>
                                  <img
                                    className="border"
                                    src={c?.options[ina]}
                                    alt={"uploaded option"}
                                    height="200px"
                                    width={"200px"}
                                  />
                                </div>
                              )
                        )}
                      </div>
                    ) : (
                      ""
                    )}

                    {queArr[index]?.type === "CHECKBOX" ? (
                      <div className="mt-3">
                        <div className="my-2 w-full border-b">
                          <span className="font-semibold text-lg pb-2 text-gray-600">
                            Correct Option:{" "}
                            {c?.correctOption &&
                            c?.correctOption.length > base64Length
                              ? c?.correctOption
                                  .split(",")
                                  ?.map((newSrc, i) => {
                                    return (
                                      <div
                                        className="flex items-center mb-3"
                                        key={i}
                                      >
                                        {newSrc?.length > base64Length ? (
                                          <div className="flex gap-2">
                                            <span>{i + 1}.</span>
                                            <img
                                              className="border mt-2"
                                              src={
                                                newSrc?.length > base64Length
                                                  ? newSrc.includes(
                                                      "data:image/png;base64,"
                                                    )
                                                    ? newSrc
                                                    : `data:image/png;base64,${newSrc}`
                                                  : newSrc
                                              }
                                              alt={"uploaded option"}
                                              height="200px"
                                              width={"200px"}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex gap-2">
                                            <span>{i + 1}.</span>
                                            <span className="font-normal text-gray-600">
                                              {newSrc}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                              : c?.correctOption?.map((newSrc, i) => {
                                  return (
                                    <div
                                      className="flex items-center mb-3"
                                      key={i}
                                    >
                                      {newSrc?.length > base64Length ? (
                                        <div className="flex gap-2">
                                          <span>{i + 1}.</span>
                                          <img
                                            className="border mt-2"
                                            src={
                                              newSrc?.length > base64Length
                                                ? newSrc.includes(
                                                    "data:image/png;base64,"
                                                  )
                                                  ? newSrc
                                                  : `data:image/png;base64,${newSrc}`
                                                : newSrc
                                            }
                                            alt={"uploaded option"}
                                            height="200px"
                                            width={"200px"}
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex gap-2">
                                          <span>{i + 1}.</span>
                                          <span className="font-normal text-gray-600">
                                            {newSrc}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                          </span>
                        </div>

                        <p className="font-semibold text-lg pb-2 text-gray-600">
                          Options:
                        </p>

                        {c?.optionTypes?.map((vsa, ina) =>
                          vsa === "text"
                            ? c?.options &&
                              c?.options[ina] && (
                                <div key={ina} className="flex mb-3 gap-2">
                                  <span>{ina + 1}.</span>
                                  <input
                                    type="text"
                                    style={{ width: "92%" }}
                                    placeholder="add option"
                                    disabled={true}
                                    value={c?.options[ina]}
                                    readOnly={true}
                                    className="outline-none px-2 text-primary border-b border-primary"
                                  />
                                </div>
                              )
                            : c?.options &&
                              c?.options[ina] && (
                                <div key={ina} className="flex mb-3 gap-2">
                                  <span>{ina + 1}.</span>
                                  <img
                                    className="border"
                                    src={c?.options[ina]}
                                    alt={"uploaded option"}
                                    height="200px"
                                    width={"200px"}
                                  />
                                </div>
                              )
                        )}
                      </div>
                    ) : (
                      ""
                    )}

                    {queArr[index]?.type === "CODE" ? (
                      <div className="mt-3">
                        <div className="my-2 w-full">
                          <p className="font-semibold text-lg pb-2 text-gray-600">
                            Answer Format:{" "}
                            <span className="font-normal text-gray-600">
                              {c?.answerFormat}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
