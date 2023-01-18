import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { EXPRESS_API_BASE_URL } from "../../constant";
import FilledButton from "../../customs/FilledButton";
import Loader from "../../customs/Loader";
import axios from "axios";
import Cookies from "universal-cookie";
import { useNavigate, useParams } from "react-router-dom";
import useWindowSize from "../../constants/UseWindowSize";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { Controlled as ControlledEditor } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import "codemirror/keymap/sublime";
import "codemirror/addon/hint/anyword-hint";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/xml-hint";
import "codemirror/addon/hint/html-hint";
import "codemirror/addon/hint/css-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/matchtags";
import "codemirror/addon/edit/trailingspace";
import "codemirror/addon/edit/continuelist";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/selection/active-line";
import { usePrompt } from "../../constants/UsePrompt";
import MainLogo from "../../assets/MainLogo.png";

const EvaluateAssignment = () => {
  const { courseId, assignmentId, id } = useParams();
  const cookies = new Cookies();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [loading, setLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const [openHtml, setOpenHtml] = useState(true);
  const [openCss, setOpenCss] = useState(true);
  const [openJS, setOpenJS] = useState(true);
  const [output, setOutput] = useState("");
  const [loadingForCEditor, setLoadingForCEditor] = useState(false);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAssignmentSubmitted, setIsAssignmentSubmitted] = useState(false);
  const [afterAnsAttemptArr, setAfterAnsAttemptArr] = useState([]);
  const [assignmentDetailsData, setAssignmentDetailsData] = useState(null);
  const [isIpadMobile, setIsIpadMobile] = useState(false);
  const [navBlocker, setNavBlocker] = useState(false);
  const [isOnChanged, setIsOnChanged] = useState(false);
  const [isNotSubmitted, setIsNotSubmitted] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [totalMarksGot, setTotalMarksGot] = useState(0);
  // const [HTML, setHTML] = useState("");
  // const [CSS, setCSS] = useState("");
  // const [JS, setJS] = useState("");

  // handle unsaved prompt
  useEffect(() => {
    if (id) {
      setNavBlocker(false);
    } else {
      if (isOnChanged === true) {
        setNavBlocker(true);
      } else {
        setNavBlocker(false);
      }
    }
  }, [id, isOnChanged]);
  usePrompt("Unsaved changes, are you sure you want to exit?", navBlocker);

  useEffect(() => {
    if (width <= 1001) {
      setIsIpadMobile(true);
    } else {
      setIsIpadMobile(false);
    }
  }, [width]);

  // get assignment details
  const getAssignmentDetailsData = async () => {
    let newArr = [];
    setLoading(true);
    let token = cookies.get("token");

    const r = await axios.get(
      `${EXPRESS_API_BASE_URL}/course/${parseInt(
        courseId
      )}/assignment/${parseInt(assignmentId)}/user/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(r.data);

    for (let index = 0; index < r.data.data.submission.length; index++) {
      const element = r.data.data.submission[index];
      // console.log("element", element);

      if (element?.submissionType !== "SUBMITTED") {
        setIsNotSubmitted(true);
      } else {
        setIsNotSubmitted(false);
      }

      if (element?.submissionType === "DRAFT") {
        setAssignmentStatus("DRAFT");
      }

      newArr.push({
        studentId: r.data.data.student.id,
        evaluation: {
          questionId: "",
          comment: "",
          score: "",
        },
        additionalData: {
          css: element?.additionalData?.css,
          html: element?.additionalData?.html,
          js: element?.additionalData?.js,
        },
        answer: element?.answer,
        submissionType: element?.submissionType,
        getComment: element?.comments,
        getScore: element?.score,
        question: {
          answerFormat: element?.question?.answerFormat,
          assignmentId: parseInt(assignmentId),
          correctOption: element?.question?.correctOption,
          id: element?.question?.id,
          maxScore: element?.question?.maxScore,
          options: element?.question?.options,
          optionTypes: element?.question?.optionTypes,
          text: element?.question?.text,
          type: element?.question?.type,
        },
      });
    }

    setLoading(false);
    setAfterAnsAttemptArr(r.data.data);
    setAssignmentDetailsData(newArr);
    setIsAssignmentSubmitted(true);
  };

  useEffect(() => {
    getAssignmentDetailsData();
  }, []);

  // // run playground code auto-run or on button click
  // const hanldeRunHtmlCode = (e, HTML, CSS, JS) => {
  //   e.preventDefault();
  //   setTimeout(() => {
  //     setSrcDoc(`
  //       <html>
  //         <body>${HTML}</body>
  //         <style>${CSS}</style>
  //         <script>${JS}</script>
  //       </html>
  //     `);
  //   }, 250);
  // };

  // run playground code auto-run
  useEffect(() => {
    // console.log("assignmentDetailsData", assignmentDetailsData);

    if (assignmentDetailsData) {
      const timeout = setTimeout(() => {
        setSrcDoc(`
        <html>
          <body>${assignmentDetailsData[0]?.additionalData?.html}</body>
          <style>${assignmentDetailsData[0]?.additionalData?.css}</style>
          <script>${assignmentDetailsData[0]?.additionalData?.js}</script>
        </html>
      `);
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [assignmentDetailsData]);

  // to run java python code
  const onRunClick = (selectedLang, e, val) => {
    e.preventDefault();

    let data = {
      source_code: val,
      language_id: selectedLang,
      number_of_runs: "1",
      stdin: "Judge0",
      expected_output: null,
      cpu_time_limit: "2",
      cpu_extra_time: "0.5",
      wall_time_limit: "5",
      memory_limit: "128000",
      stack_limit: "64000",
      max_processes_and_or_threads: "60",
      enable_per_process_and_thread_time_limit: false,
      enable_per_process_and_thread_memory_limit: false,
      max_file_size: "1024",
    };

    setLoadingForCEditor(true);

    fetch("https://judge0-ce.p.rapidapi.com/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        return res.json();
      })
      .then(async (resToken) => {
        // console.log(resToken);
        return new Promise((res, rej) => {
          setTimeout(async () => {
            const r = await fetch(
              "https://judge0-ce.p.rapidapi.com/submissions/" + resToken.token,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "X-RapidAPI-Key": "",
                  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
              }
            );
            const response = await r.json();
            res(response);
          }, 5000);
        });
      })
      .then((res) => {
        if (res) {
          if (res.stdout === null) {
            setShowErrorMsg(true);

            if (res.stderr) {
              setErrorMsg(res.stderr);
            } else {
              setErrorMsg("Try later...");
            }
          } else {
            setShowErrorMsg(false);
            setOutput(res.stdout);
          }
        }

        // console.log("output res", res);
        setLoadingForCEditor(false);
      });
  };

  const onSubmit = async (values, e) => {
    e.preventDefault();
    let token = cookies.get("token");

    try {
      setLoading(true);
      let ansArr = [];
      for (let index = 0; index < values?.mainAns.length; index++) {
        const element = values?.mainAns[index];

        if (element?.evaluation?.comment && element?.evaluation?.score) {
          if (
            parseInt(element?.evaluation?.score) >
            parseInt(element?.question?.maxScore)
          ) {
            setLoading(false);
            return toast.warning(
              `Marks should not be greater than ${parseInt(
                element?.question?.maxScore
              )} for Q. ${index + 1}!`,
              {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3000,
              }
            );
          } else if (parseInt(element?.evaluation?.score) < 0) {
            setLoading(false);
            return toast.warning(
              `Marks cannot be negative for Q. ${index + 1}!`,
              {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3000,
              }
            );
          } else {
            ansArr.push({
              questionId: parseInt(element?.question?.id),
              comment: element?.evaluation?.comment,
              score: parseInt(element?.evaluation?.score),
            });
          }
        } else {
          setLoading(false);
          return toast.warning(
            `Comment and Marks are required for Q. ${index + 1}!`,
            {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 3000,
            }
          );
        }
      }

      let projectData = {
        studentId: parseInt(id),
        evaluation: ansArr,
      };
      // console.log("onreviewed projectData", projectData);

      const res = await axios.post(
        `${EXPRESS_API_BASE_URL}/course/${parseInt(
          courseId
        )}/assignment/${parseInt(assignmentId)}/evaluate`,
        projectData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log("onreviewed res", res);
      toast.success("Successfully reviewed assignment!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      navigate(`/teacher/assignment/submissions`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("onreviewed assignment error", error);
    }
  };

  // calculation for toal of marks and total marks
  useEffect(() => {
    // console.log("assignmentDetailsData", assignmentDetailsData);

    if (assignmentDetailsData) {
      if (
        assignmentDetailsData[0]?.submissionType === "REVIEWED" &&
        (assignmentDetailsData[0]?.getScore !== "" ||
          assignmentDetailsData[0]?.getScore !== 0)
      ) {
        // total of score
        let newArr = assignmentDetailsData.map((s) => {
          return parseInt(s?.getScore);
        });
        const sum = newArr.reduce((v, a) => v + a, 0);
        setTotalMarksGot(sum);

        // total marks
        let newTMArr = assignmentDetailsData.map((s) => {
          return parseInt(s?.question.maxScore);
        });
        const TM = newTMArr.reduce((v, a) => v + a, 0);
        setTotalMarks(TM);
      }
    }
  }, [assignmentDetailsData]);

  return (
    <div className="w-full">
      {loading === true ? (
        <Loader />
      ) : (
        <Formik
          initialValues={{
            mainAns: assignmentDetailsData,
          }}
          enableReinitialize
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            // setSubmitting(true);
            // resetForm();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="w-full mx-auto flex justify-center items-center pb-10 preventPageCopyPaste">
                <div className={`w-11/12`}>
                  <div className="bg-secondary pt-32 laptop:pt-28 ipad:pt-36 mobile:pt-28">
                    {/* <div className="w-3/5 flex justify-between mobile:flex-col ipad:w-full mobile:w-full"> */}
                    {/* <p className="text-center text-3xl font-bold mobile:text-2xl">
                          {afterAnsAttemptArr?.assignment?.title}
                        </p> */}
                    <div className="w-full flex mobile:flex-col">
                      <p
                        className="text-3xl font-bold mobile:text-2xl break-words"
                        style={{
                          position: "relative",
                          left: width < 500 ? "" : "38%",
                          width: width < 500 ? "" : "60%",
                        }}
                      >
                        {afterAnsAttemptArr?.assignment?.title}
                      </p>

                      {isNotSubmitted ? (
                        <></>
                      ) : (
                        <div className="w-full flex justify-end items-center gap-5 mobile:mt-2 mobile:justify-center">
                          <FilledButton
                            onClickFilled={(e) => onSubmit(values, e)}
                            filledBtnText="Submit"
                            loading={loading}
                            // filledBtnType="submit"
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-1/2 ipad:w-full mobile:w-full mx-auto ">
                      <div className="w-full h-full flex justify-center items-center my-5">
                        <img
                          src={
                            afterAnsAttemptArr?.assignment?.featureImage
                              ? afterAnsAttemptArr?.assignment?.featureImage
                              : MainLogo
                          }
                          alt="assignmentImg"
                          style={{ width: isIpadMobile ? "90%" : "70%" }}
                        />
                      </div>
                    </div>
                  </div>

                  {totalMarksGot && totalMarksGot !== 0 ? (
                    <div className=" w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full mx-auto my-10 relative">
                      <p className="text-2xl font-semibold absolute right-0">
                        Marks : {totalMarksGot} / {totalMarks}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className="flex justify-center items-center">
                    <div
                      className="mt-3 w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full"
                      // style={{ width: isIpadMobile ? "100%" : "70%" }}
                    >
                      {assignmentStatus === "DRAFT" ? (
                        <p className="text-red-600 text-sm">
                          *currently assignment is in the Draft state!
                        </p>
                      ) : (
                        <></>
                      )}

                      <p className="font-semibold my-2 flex justify-start">
                        Assignment description:
                      </p>
                      <div
                        className="w-full my-3"
                        dangerouslySetInnerHTML={{
                          __html: afterAnsAttemptArr?.assignment?.description,
                        }}
                      >
                        {/* <CKEditor
                          editor={ClassicEditor}
                          data={afterAnsAttemptArr?.assignment?.description}
                          disabled={true}
                          config={{
                            toolbar: [],
                            isReadOnly: true,
                          }}
                        /> */}
                      </div>

                      <p className="text-3xl font-semibold mt-3 mb-2 mobile:text-2xl flex justify-start">
                        Questions:
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    <div className="w-full">
                      {values?.mainAns?.map((val, mainindex) => {
                        return (
                          <div className="" key={mainindex}>
                            <div className="w-full flex justify-center items-center">
                              <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                {val?.question?.type === "MCQ" ? (
                                  <div>
                                    <div className="w-full my-3 flex items-center">
                                      <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                        mainindex + 1
                                      }`}</span>

                                      <div
                                        className="w-full"
                                        dangerouslySetInnerHTML={{
                                          __html: val?.question?.text,
                                        }}
                                      >
                                        {/* <CKEditor
                                          editor={ClassicEditor}
                                          data={val?.question?.text}
                                          disabled={true}
                                          config={{
                                            toolbar: [],
                                            isReadOnly: true,
                                          }}
                                        /> */}
                                      </div>
                                    </div>

                                    <div className="teachers-remarks">
                                      <div className="text-lg">
                                        Your Remarks
                                      </div>
                                      <div className="my-4">
                                        <TextField
                                          style={{
                                            width: "100%",
                                          }}
                                          disabled={
                                            isNotSubmitted ? true : false
                                          }
                                          id="outlined-multiline-flexible"
                                          label={`${
                                            val?.getComment
                                              ? "Comment"
                                              : "Add Comment"
                                          }`}
                                          value={
                                            val?.getComment
                                              ? val?.getComment
                                              : val?.evaluation?.comment
                                          }
                                          onChange={(e) => {
                                            setFieldValue(
                                              `mainAns[${mainindex}].evaluation.comment`,
                                              e.target.value
                                            );
                                            setIsOnChanged(true);
                                          }}
                                        />
                                      </div>

                                      <div className="">
                                        <TextField
                                          style={{
                                            width: "100%",
                                          }}
                                          disabled={
                                            isNotSubmitted ? true : false
                                          }
                                          id="outlined-multiline-flexible"
                                          label={`${
                                            val?.getScore
                                              ? "Marks out of"
                                              : "Add Marks out of"
                                          } ${val?.question?.maxScore}`}
                                          type="number"
                                          value={
                                            val?.getScore
                                              ? val?.getScore
                                              : val?.evaluation?.score
                                          }
                                          onChange={(e) =>
                                            setFieldValue(
                                              `mainAns[${mainindex}].evaluation.score`,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>

                                    <p className="w-full mt-3 text-xl font-semibold mobile:text-base">
                                      Options:
                                    </p>
                                    <div className="border rounded-lg p-1 my-1">
                                      <RadioGroup
                                        value={val?.answer}
                                        name="picked"
                                      >
                                        {val?.question?.options?.map(
                                          (v, index) => {
                                            return (
                                              <div key={index}>
                                                <FormControlLabel
                                                  control={
                                                    <Radio
                                                      disabled={
                                                        isAssignmentSubmitted ===
                                                        true
                                                          ? true
                                                          : false
                                                      }
                                                      sx={{
                                                        "&, &.Mui-checked": {
                                                          color: "#006b5c",
                                                        },
                                                        color: "#006b5c",
                                                      }}
                                                      value={v}
                                                    />
                                                  }
                                                  label={
                                                    val?.question?.optionTypes[
                                                      index
                                                    ] === "text" ? (
                                                      v
                                                    ) : (
                                                      <img
                                                        className="border mt-2"
                                                        src={v}
                                                        alt={"uploaded option"}
                                                        height="200px"
                                                        width={"200px"}
                                                      />
                                                    )
                                                  }
                                                />
                                              </div>
                                            );
                                          }
                                        )}
                                      </RadioGroup>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            <div className="w-full flex justify-center items-center">
                              <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                {val?.question?.type === "CHECKBOX" ? (
                                  <div>
                                    <div className="w-full my-3 flex items-center">
                                      <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                        mainindex + 1
                                      }`}</span>

                                      <div
                                        className="w-full"
                                        dangerouslySetInnerHTML={{
                                          __html: val?.question?.text,
                                        }}
                                      >
                                        {/* <CKEditor
                                          editor={ClassicEditor}
                                          data={val?.question?.text}
                                          disabled={true}
                                          config={{
                                            toolbar: [],
                                            isReadOnly: true,
                                          }}
                                        /> */}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Your Evaluation
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getComment
                                                ? "Comment"
                                                : "Add Comment"
                                            }`}
                                            value={
                                              val?.getComment
                                                ? val?.getComment
                                                : val?.evaluation?.comment
                                            }
                                            onChange={(e) => {
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.comment`,
                                                e.target.value
                                              );
                                              setIsOnChanged(true);
                                            }}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getScore
                                                ? "Marks out of"
                                                : "Add Marks out of"
                                            } ${val?.question?.maxScore}`}
                                            type="number"
                                            value={
                                              val?.getScore
                                                ? val?.getScore
                                                : val?.evaluation?.score
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.score`,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>

                                      <p className="w-full mt-3 text-xl font-semibold mobile:text-base">
                                        Correct Options:
                                      </p>
                                      <div className="border rounded-lg p-1 my-1">
                                        {val?.question?.correctOption
                                          ?.split(",")
                                          ?.map((s, idn) => {
                                            return (
                                              <div
                                                key={idn}
                                                className="my-4 flex items-center gap-2 overflow-auto"
                                              >
                                                <p>{idn + 1}.</p>
                                                <div className="flex flex-col">
                                                  {s?.length > 10000 ? (
                                                    <img
                                                      className="border"
                                                      src={
                                                        s?.length > 10000
                                                          ? s.includes(
                                                              "data:image/png;base64,"
                                                            )
                                                            ? s
                                                            : `data:image/png;base64,${s}`
                                                          : s
                                                      }
                                                      alt={"uploaded option"}
                                                      height="200px"
                                                      width={"200px"}
                                                    />
                                                  ) : (
                                                    <p className="w-full text-xl mobile:text-base">
                                                      {s}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>

                                    <p className="w-full mt-3 text-xl font-semibold mobile:text-base">
                                      Options:
                                    </p>
                                    <div className="border rounded-lg p-1 my-1">
                                      <FormGroup>
                                        {val?.question?.options?.map((v, i) => {
                                          return (
                                            <div key={i}>
                                              <FormControlLabel
                                                label={
                                                  val?.question?.optionTypes[
                                                    i
                                                  ] === "text" ? (
                                                    v
                                                  ) : (
                                                    <img
                                                      className="border mt-2"
                                                      src={v}
                                                      alt={"uploaded option"}
                                                      height="200px"
                                                      width={"200px"}
                                                    />
                                                  )
                                                }
                                                control={
                                                  <Checkbox
                                                    disabled={
                                                      isAssignmentSubmitted ===
                                                      true
                                                        ? true
                                                        : false
                                                    }
                                                    sx={{
                                                      color: "#006b5c",
                                                      "&.Mui-checked": {
                                                        color: "#006b5c",
                                                      },
                                                    }}
                                                    checked={val?.answer
                                                      .split(",")
                                                      .includes(v)}
                                                    name="checked"
                                                    // value={v}
                                                  />
                                                }
                                              />
                                            </div>
                                          );
                                        })}
                                      </FormGroup>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            <div className="w-full flex justify-center items-center">
                              <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                {val?.question?.type === "TEXT" ? (
                                  <div>
                                    <div className="w-full my-3 flex items-center">
                                      <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                        mainindex + 1
                                      }`}</span>

                                      <div
                                        className="w-full"
                                        dangerouslySetInnerHTML={{
                                          __html: val?.question?.text,
                                        }}
                                      >
                                        {/* <CKEditor
                                          editor={ClassicEditor}
                                          data={val?.question?.text}
                                          disabled={true}
                                          config={{
                                            toolbar: [],
                                            isReadOnly: true,
                                          }}
                                        /> */}
                                      </div>
                                    </div>

                                    <div className="teachers-remarks">
                                      <div className="text-lg">
                                        Your Evaluation
                                      </div>
                                      <div className="my-4">
                                        <TextField
                                          style={{
                                            width: "100%",
                                          }}
                                          disabled={
                                            isNotSubmitted ? true : false
                                          }
                                          id="outlined-multiline-flexible"
                                          label={`${
                                            val?.getComment
                                              ? "Comment"
                                              : "Add Comment"
                                          }`}
                                          value={
                                            val?.getComment
                                              ? val?.getComment
                                              : val?.evaluation?.comment
                                          }
                                          onChange={(e) => {
                                            setFieldValue(
                                              `mainAns[${mainindex}].evaluation.comment`,
                                              e.target.value
                                            );
                                            setIsOnChanged(true);
                                          }}
                                        />
                                      </div>

                                      <div className="">
                                        <TextField
                                          style={{
                                            width: "100%",
                                          }}
                                          disabled={
                                            isNotSubmitted ? true : false
                                          }
                                          id="outlined-multiline-flexible"
                                          label={`${
                                            val?.getScore
                                              ? "Marks out of"
                                              : "Add Marks out of"
                                          } ${val?.question?.maxScore}`}
                                          type="number"
                                          value={
                                            val?.getScore
                                              ? val?.getScore
                                              : val?.evaluation?.score
                                          }
                                          onChange={(e) =>
                                            setFieldValue(
                                              `mainAns[${mainindex}].evaluation.score`,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-4">
                                      <TextField
                                        disabled={
                                          isAssignmentSubmitted === true
                                            ? true
                                            : false
                                        }
                                        style={{
                                          width: "100%",
                                        }}
                                        id="outlined-multiline-flexible"
                                        label="Answer"
                                        multiline
                                        rows={4}
                                        value={val?.answer}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            <div>
                              {val?.question?.answerFormat !== "HTML" &&
                              val?.question?.type === "CODE" &&
                              val?.question?.answerFormat !== "SCRATCH" ? (
                                <div className="w-full">
                                  <div className="flex justify-center items-center">
                                    <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                      <div className="w-full my-3 flex items-center">
                                        <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                          mainindex + 1
                                        }`}</span>

                                        <div
                                          className="w-full font-bold text-2xl mobile:text-lg"
                                          dangerouslySetInnerHTML={{
                                            __html: val?.question?.text,
                                          }}
                                        >
                                          {/* <CKEditor
                                            editor={ClassicEditor}
                                            data={val?.question?.text}
                                            disabled={true}
                                            config={{
                                              toolbar: [],
                                              isReadOnly: true,
                                            }}
                                          /> */}
                                        </div>
                                      </div>

                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Your Evaluation
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getComment
                                                ? "Comment"
                                                : "Add Comment"
                                            }`}
                                            value={
                                              val?.getComment
                                                ? val?.getComment
                                                : val?.evaluation?.comment
                                            }
                                            onChange={(e) => {
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.comment`,
                                                e.target.value
                                              );
                                              setIsOnChanged(true);
                                            }}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getScore
                                                ? "Marks out of"
                                                : "Add Marks out of"
                                            } ${val?.question?.maxScore}`}
                                            type="number"
                                            value={
                                              val?.getScore
                                                ? val?.getScore
                                                : val?.evaluation?.score
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.score`,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="w-full flex justify-center items-center mt-4">
                                    <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                      <div className="flex flex-row ipad:flex-col mobile:flex-col">
                                        <div className="h-450 w-1/2 ipad:w-full mobile:w-full ipad:mb-12 mobile:mb-12">
                                          <div className="controls">
                                            {val?.answer?.length > 0 ? (
                                              <button
                                                onClick={(e) =>
                                                  onRunClick(
                                                    val?.question
                                                      ?.answerFormat ===
                                                      "PYTHON"
                                                      ? 71
                                                      : 62,
                                                    e,
                                                    val?.answer
                                                  )
                                                }
                                                className="bg-gray-700 text-white px-2 rounded-md uppercase"
                                              >
                                                RUN
                                              </button>
                                            ) : (
                                              <></>
                                            )}
                                          </div>

                                          <AceEditor
                                            placeholder="write your code"
                                            // mode="html"
                                            theme="github"
                                            name="blah2"
                                            width="100%"
                                            height="100%"
                                            readOnly={
                                              isAssignmentSubmitted === true
                                                ? true
                                                : false
                                            }
                                            // onLoad={onLoad}
                                            fontSize={16}
                                            showPrintMargin={true}
                                            showGutter={true}
                                            highlightActiveLine={true}
                                            value={val?.answer}
                                            setOptions={{
                                              enableBasicAutocompletion: true,
                                              enableLiveAutocompletion: true,
                                              enableSnippets: true,
                                              showLineNumbers: true,
                                              tabSize: 2,
                                            }}
                                          />
                                        </div>

                                        <div className="border output h-480 w-1/2 ipad:w-full mobile:w-full">
                                          <p className="text-xl border-b border-gray-300 py-1">
                                            Output:
                                          </p>

                                          <div className="">
                                            {loadingForCEditor === true ? (
                                              <div className="pt-5 flex justify-center items-center">
                                                <span className="text-primary font-semibold text-2xl z-10">
                                                  Loading...
                                                </span>
                                              </div>
                                            ) : showErrorMsg === true ? (
                                              <span className="text-red-600">
                                                {errorMsg}
                                              </span>
                                            ) : (
                                              <span className="">{output}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>

                            <div className="w-full flex justify-center items-center">
                              {val?.question?.answerFormat === "HTML" &&
                              val?.question?.type === "CODE" &&
                              val?.question?.answerFormat !== "SCRATCH" ? (
                                <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                  <div className="flex justify-center items-center">
                                    <div className="w-full">
                                      <div className="w-full my-3 flex items-center">
                                        <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                          mainindex + 1
                                        }`}</span>

                                        <div
                                          className="w-full font-bold text-2xl mobile:text-lg"
                                          dangerouslySetInnerHTML={{
                                            __html: val?.question?.text,
                                          }}
                                        >
                                          {/* <CKEditor
                                            editor={ClassicEditor}
                                            data={val?.question?.text}
                                            disabled={true}
                                            config={{
                                              toolbar: [],
                                              isReadOnly: true,
                                            }}
                                          /> */}
                                        </div>
                                      </div>

                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Your Remarks
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getComment
                                                ? "Comment"
                                                : "Add Comment"
                                            }`}
                                            value={
                                              val?.getComment
                                                ? val?.getComment
                                                : val?.evaluation?.comment
                                            }
                                            onChange={(e) => {
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.comment`,
                                                e.target.value
                                              );
                                              setIsOnChanged(true);
                                            }}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getScore
                                                ? "Marks out of"
                                                : "Add Marks out of"
                                            } ${val?.question?.maxScore}`}
                                            type="number"
                                            value={
                                              val?.getScore
                                                ? val?.getScore
                                                : val?.evaluation?.score
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.score`,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="w-full flex justify-center mt-5 ipad:flex-col mobile:flex-col">
                                    <div className="pane flex flex-col top-pane w-11/12 ipad:w-full mobile:w-full mx-auto">
                                      <div
                                        className={`editor-container ${
                                          openHtml ? "" : "collapsed"
                                        }`}
                                      >
                                        <div className={`editor-title `}>
                                          HTML
                                          <button
                                            type="button"
                                            className="expand-collapse-btn mobile:hidden"
                                            onClick={() =>
                                              setOpenHtml(
                                                (prevOpen) => !prevOpen
                                              )
                                            }
                                          >
                                            {openHtml ? (
                                              <BiCollapse />
                                            ) : (
                                              <BiExpand />
                                            )}
                                          </button>
                                        </div>

                                        <ControlledEditor
                                          value={val?.additionalData?.html}
                                          className="code-mirror-wrapper"
                                          options={{
                                            readOnly:
                                              isAssignmentSubmitted === true
                                                ? true
                                                : false,
                                            lint: true,
                                            mode: "xml",
                                            theme: "material",
                                            lineNumbers: true,
                                            lineWrapping: true,
                                            smartIndent: true,
                                            autoCloseTags: true,
                                            keyMap: "sublime",
                                            matchTags: true,
                                            matchBrackets: true,
                                            autoCloseBrackets: true,
                                            extraKeys: {
                                              "Ctrl-Space": "autocomplete",
                                            },
                                          }}
                                        />
                                      </div>

                                      <div
                                        className={`editor-container ${
                                          openCss ? "" : "collapsed"
                                        }`}
                                      >
                                        <div className="editor-title">
                                          CSS
                                          <button
                                            type="button"
                                            className="expand-collapse-btn mobile:hidden"
                                            onClick={() =>
                                              setOpenCss(
                                                (prevOpen) => !prevOpen
                                              )
                                            }
                                          >
                                            {openCss ? (
                                              <BiCollapse />
                                            ) : (
                                              <BiExpand />
                                            )}
                                          </button>
                                        </div>

                                        <ControlledEditor
                                          value={val?.additionalData?.css}
                                          className="code-mirror-wrapper"
                                          options={{
                                            readOnly:
                                              isAssignmentSubmitted === true
                                                ? true
                                                : false,
                                            lint: true,
                                            mode: "css",
                                            theme: "material",
                                            lineNumbers: true,
                                            lineWrapping: true,
                                            smartIndent: true,
                                            autoCloseTags: true,
                                            keyMap: "sublime",
                                            matchTags: true,
                                            matchBrackets: true,
                                            autoCloseBrackets: true,
                                            extraKeys: {
                                              "Ctrl-Space": "autocomplete",
                                            },
                                          }}
                                        />
                                      </div>

                                      <div
                                        className={`editor-container ${
                                          openJS ? "" : "collapsed"
                                        }`}
                                      >
                                        <div className="editor-title">
                                          JS
                                          <button
                                            type="button"
                                            className="expand-collapse-btn mobile:hidden"
                                            onClick={() =>
                                              setOpenJS((prevOpen) => !prevOpen)
                                            }
                                          >
                                            {openJS ? (
                                              <BiCollapse />
                                            ) : (
                                              <BiExpand />
                                            )}
                                          </button>
                                        </div>

                                        <ControlledEditor
                                          value={val?.additionalData?.js}
                                          className="code-mirror-wrapper"
                                          options={{
                                            readOnly:
                                              isAssignmentSubmitted === true
                                                ? true
                                                : false,
                                            lint: true,
                                            mode: "javascript",
                                            theme: "material",
                                            lineNumbers: true,
                                            lineWrapping: true,
                                            smartIndent: true,
                                            autoCloseTags: true,
                                            keyMap: "sublime",
                                            matchTags: true,
                                            matchBrackets: true,
                                            autoCloseBrackets: true,
                                            extraKeys: {
                                              "Ctrl-Space": "autocomplete",
                                            },
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="pane border-2 border-primary w-11/12 ipad:w-full mobile:w-full mx-auto">
                                      <div className="flex items-center p-1 border-b bg-secondary">
                                        {/* {val?.additionalData?.html?.length >
                                        0 ? (
                                          <button
                                            onClick={(e) =>
                                              hanldeRunHtmlCode(
                                                e,
                                                val?.additionalData?.html,
                                                val?.additionalData?.css,
                                                val?.additionalData?.js
                                              )
                                            }
                                            className={`font-semibold bg-primary px-2 text-white rounded-md h-8`}
                                          >
                                            RUN
                                          </button>
                                        ) : (
                                          <></>
                                        )} */}

                                        <p className="text-center text-2xl font-semibold w-full">
                                          Output:
                                        </p>
                                      </div>

                                      <iframe
                                        className="pb-5"
                                        srcDoc={srcDoc}
                                        title="output"
                                        sandbox="allow-scripts"
                                        frameBorder="0"
                                        width="100%"
                                        height="100%"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>

                            <div className="flex justify-center items-center">
                              {val?.question?.type === "FILE" ||
                              (val?.question?.type === "CODE" &&
                                val?.question?.answerFormat === "SCRATCH") ? (
                                <div className="w-full">
                                  <div className="flex justify-center items-center">
                                    <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                      <div className="w-full my-3 flex items-center">
                                        <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                          mainindex + 1
                                        }`}</span>

                                        <div
                                          className="w-full font-bold text-2xl mobile:text-lg"
                                          dangerouslySetInnerHTML={{
                                            __html: val?.question?.text,
                                          }}
                                        >
                                          {/* <CKEditor
                                            editor={ClassicEditor}
                                            data={val?.question?.text}
                                            disabled={true}
                                            config={{
                                              toolbar: [],
                                              isReadOnly: true,
                                            }}
                                          /> */}
                                        </div>
                                      </div>

                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Your Remarks
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getComment
                                                ? "Comment"
                                                : "Add Comment"
                                            }`}
                                            value={
                                              val?.getComment
                                                ? val?.getComment
                                                : val?.evaluation?.comment
                                            }
                                            onChange={(e) => {
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.comment`,
                                                e.target.value
                                              );
                                              setIsOnChanged(true);
                                            }}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            style={{
                                              width: "100%",
                                            }}
                                            disabled={
                                              isNotSubmitted ? true : false
                                            }
                                            id="outlined-multiline-flexible"
                                            label={`${
                                              val?.getScore
                                                ? "Marks out of"
                                                : "Add Marks out of"
                                            } ${val?.question?.maxScore}`}
                                            type="number"
                                            value={
                                              val?.getScore
                                                ? val?.getScore
                                                : val?.evaluation?.score
                                            }
                                            onChange={(e) =>
                                              setFieldValue(
                                                `mainAns[${mainindex}].evaluation.score`,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    className="border border-primary bg-primary text-white text-center rounded-xl py-2 w-1/2
                                      ipad:w-full mobile:w-full flex justify-center items-center mx-auto mt-4"
                                  >
                                    <a
                                      href={`${EXPRESS_API_BASE_URL}/scratch/`}
                                      target="blank"
                                    >
                                      Open Scratch Editor
                                    </a>
                                  </button>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default EvaluateAssignment;
