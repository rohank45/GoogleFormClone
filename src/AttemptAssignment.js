import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FilledButton from "../../customs/FilledButton";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { EXPRESS_API_BASE_URL } from "../../constant";
import UnFilledButton from "../../customs/UnFilledButton";
import { TextField } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import useWindowSize from "../../constants/UseWindowSize";
import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Formik, Form } from "formik";
import axios from "axios";
import Cookies from "universal-cookie";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import Loader from "../../customs/Loader";
import { Controlled as ControlledEditor } from "react-codemirror2";
import { BiExpand, BiCollapse } from "react-icons/bi";
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

const AttemptAssignment = () => {
  const { id } = useParams();
  const cookies = new Cookies();
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowSize();
  const [loading, setLoading] = useState(false);
  // const [isAssignmentDrafted, setIsAssignmentDrafted] = useState(false);
  const [isAssignmentSubmitted, setIsAssignmentSubmitted] = useState(false);
  const [isNewAssignmentSubmitted, setIsNewAssignmentSubmitted] =
    useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [assignmentDetailsData, setAssignmentDetailsData] = useState(null);
  const [loadingForCEditor, setLoadingForCEditor] = useState(false);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [srcDoc, setSrcDoc] = useState("");
  const [openHtml, setOpenHtml] = useState(true);
  const [openCss, setOpenCss] = useState(true);
  const [openJS, setOpenJS] = useState(true);
  const [isIpadMobile, setIsIpadMobile] = useState(false);
  const [afterAnsAttemptArr, setAfterAnsAttemptArr] = useState([]);
  const [navBlocker, setNavBlocker] = useState(false);
  const [isOnChanged, setIsOnChanged] = useState(false);
  const [isBtnCalling, setIsBtnCalling] = useState(false);
  const [HTML, setHTML] = useState("");
  const [CSS, setCSS] = useState("");
  const [JS, setJS] = useState("");
  const [isTeacherLogin, setIsTeacherLogin] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [totalMarksGot, setTotalMarksGot] = useState(0);
  let token = cookies.get("token");

  const checkUser = () => {
    if (cookies.get("isTeacherLogin")) {
      setIsTeacherLogin(true);
    } else {
      setIsTeacherLogin(false);
    }
  };

  const checkisAdmin = () => {
    if (cookies.get("isAdminLogin")) {
      setIsAdminLogin(true);
    } else {
      setIsAdminLogin(false);
    }
  };

  useEffect(() => {
    checkUser();
    checkisAdmin();
  }, []);

  useEffect(() => {
    if (location.state && location.state?.courseId) {
      setCourseId(parseInt(location.state?.courseId));
    }
  }, [location.state]);

  // handle unsaved prompt
  useEffect(() => {
    if (id && isOnChanged === false && isBtnCalling === true) {
      setNavBlocker(false);
    } else if (isOnChanged === true && isBtnCalling === true) {
      setNavBlocker(false);
    } else {
      if (isOnChanged === true) {
        setNavBlocker(true);
      } else {
        setNavBlocker(false);
      }
    }
  }, [id, isOnChanged, isBtnCalling]);
  usePrompt("Unsaved changes, are you sure you want to exit?", navBlocker);

  useEffect(() => {
    if (width <= 1001) {
      setIsIpadMobile(true);
    } else {
      setIsIpadMobile(false);
    }
  }, [width]);

  // run playground code on button click
  const hanldeRunHtmlCode = (e, HTML, CSS, JS) => {
    e.preventDefault();
    setTimeout(() => {
      setSrcDoc(`
        <html>
          <body>${HTML}</body>
          <style>${CSS}</style>
          <script>${JS}</script>
        </html>
      `);
    }, 250);
  };

  // run playground code auto-run
  useEffect(() => {
    if (isNewAssignmentSubmitted === true) {
      const timeout = setTimeout(() => {
        setSrcDoc(`
        <html>
          <body>${HTML}</body>
          <style>${CSS}</style>
          <script>${JS}</script>
        </html>
      `);
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [isNewAssignmentSubmitted, HTML, CSS, JS]);

  // to run java python code
  const onRunClick = (selectedLang, e, val) => {
    e.preventDefault();

    let data = {
      source_code: val ? val : code,
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

  // screenshot of the whole page saved as pdf
  const getPdf = () => {
    html2canvas(document.querySelector("#root"), {
      allowTaint: false,
      useCORS: true,
      logging: true,
      windowWidth: "1280px",
      scrollY: -window.scrollY,
      // scrollX: 0,
      // scrollY: 0,
      onclone: (document) => {
        document.getElementById("print").style.visibility = "hidden";
      },
    })
      .then((canvas) => {
        setLoading(true);
        let wid;
        let hgt;
        const img = canvas.toDataURL(
          "image/png",
          (wid = canvas.width),
          (hgt = canvas.height)
        );
        const hratio = hgt / wid;
        const doc = new jsPDF("p", "mm", "a4");
        const width = doc.internal.pageSize.width;
        const height = width * hratio;

        doc.addImage(img, "PNG", 0, 0, width, height);
        doc.save(`AssignmentDetails${new Date().toISOString()}.pdf`);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log("getpdf error", err);
      });
  };

  const onDownload = () => {
    setTimeout(() => {
      getPdf();
    }, 100);
  };

  // useEffect(() => {
  //   let x = document.getElementsByTagName("body");

  //   if (timepa === true) {
  //     // x[0].style.lineHeight = "0.5 !important";
  //     // x[0].style.backgroundColor = "red";
  //   } else {
  //     // x[0].style.lineHeight = "none";
  //     // x[0].style.backgroundColor = "white";
  //   }
  // }, [timepa]);

  // get assignment details student side
  const getAssignmentDetailsData = async () => {
    try {
      setLoading(true);
      let newType = "NEW";
      let mainRes;
      let isFreshedAssignment = location.state?.submissionStatusParam;

      // after submission
      if (
        courseId &&
        (isFreshedAssignment === "DRAFT" ||
          isFreshedAssignment === "SUBMITTED" ||
          isFreshedAssignment === "REVIEWED")
      ) {
        let newres1 = await axios.get(
          `${EXPRESS_API_BASE_URL}/course/${courseId}/assignment/${parseInt(
            id
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (newres1) {
          setHTML(newres1?.data.data[0]?.submission[0]?.additionalData?.html);
          setCSS(newres1?.data.data[0]?.submission[0]?.additionalData?.css);
          setJS(newres1?.data.data[0]?.submission[0]?.additionalData?.js);
          setAssignmentDetailsData(newres1?.data.data[0]?.assignment);

          // console.log("after submission", newres1.data.data);

          if (newres1?.data.data[0]?.submission?.length > 0) {
            newType = newres1?.data.data[0]?.submission[0].submissionType;

            if (newType !== "NEW") {
              mainRes = newres1?.data.data[0]?.submission;
            }

            if (newType === "SUBMITTED" || newType === "REVIEWED") {
              setIsAssignmentSubmitted(true);
            } else {
              setIsAssignmentSubmitted(false);
            }

            if (
              newType === "SUBMITTED" ||
              newType === "REVIEWED" ||
              newType === "DRAFT"
            ) {
              setIsNewAssignmentSubmitted(true);
            } else {
              setIsNewAssignmentSubmitted(false);
            }
          }
        }
      } else {
        // before submission
        let newres2 = await axios.get(
          `${EXPRESS_API_BASE_URL}/assignment/${parseInt(id)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // console.log("before submission", newres2.data.data);

        if (newres2) {
          setAssignmentDetailsData(newres2?.data?.data);
          if (newres2?.data.data?.Question?.length > 0) {
            mainRes = newres2?.data?.data?.Question;
          }
        }
      }

      if (mainRes) {
        let newArr = [];
        for (let index = 0; index < mainRes.length; index++) {
          const element = mainRes[index];

          newArr.push({
            answerFormat:
              newType === "NEW"
                ? element?.answerFormat
                : element?.question?.answerFormat,
            assignmentId:
              newType === "NEW"
                ? element?.assignmentId
                : element?.question?.assignmentId,
            maxScore:
              newType === "NEW"
                ? element?.maxScore
                : element?.question?.maxScore,
            text: newType === "NEW" ? element?.text : element?.question?.text,
            type: newType === "NEW" ? element?.type : element?.question?.type,
            correctOption:
              newType === "NEW"
                ? element?.correctOption
                : element?.question?.correctOption,
            options:
              newType === "NEW" ? element?.options : element?.question?.options,
            optionTypes:
              newType === "NEW"
                ? element?.optionTypes
                : element?.question?.optionTypes,
            comments: newType === "NEW" ? "" : element?.comments,
            score: newType === "NEW" ? "" : element?.score,
            submissionType: newType === "NEW" ? "" : element?.submissionType,
            question: {
              queId: newType === "NEW" ? element?.id : element?.question?.id,
              ans: {
                checkedAns: newType === "NEW" ? [] : element?.answer,
                pickedAns: newType === "NEW" ? "" : element?.answer,
                textAns: newType === "NEW" ? "" : element?.answer,
                codeAns: newType === "NEW" ? "" : element?.answer,
                htmlAns: newType === "NEW" ? "" : element?.answer,
              },
              additionalData: {
                html: newType === "NEW" ? "" : element?.additionalData?.html,
                css: newType === "NEW" ? "" : element?.additionalData?.css,
                js: newType === "NEW" ? "" : element?.additionalData?.js,
              },
            },
          });
        }

        setAfterAnsAttemptArr(newArr);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("get my AssignmentDetails error", error);
    }
  };

  useEffect(() => {
    getAssignmentDetailsData();
  }, [courseId]);

  // save as draft
  const onSaveAsDraft = async (values, e) => {
    e.preventDefault();
    setIsBtnCalling(true);

    try {
      setLoading(true);
      let ansArr = [];
      for (let index = 0; index < values?.mainAns.length; index++) {
        const element = values?.mainAns[index];

        switch (element?.type) {
          case "CODE":
            if (element?.answerFormat === "HTML") {
              ansArr.push({
                questionId: element?.question?.queId,
                answer: element?.question?.ans?.htmlAns,
                additionalData: {
                  html: element?.question?.additionalData?.html,
                  css: element?.question?.additionalData?.css,
                  js: element?.question?.additionalData?.js,
                },
              });
            } else if (
              element?.answerFormat === "PYTHON" ||
              element?.answerFormat === "JAVA"
            ) {
              ansArr.push({
                questionId: element?.question?.queId,
                answer: element?.question?.ans?.codeAns,
                additionalData: {
                  html: element?.question?.additionalData?.html,
                  css: element?.question?.additionalData?.css,
                  js: element?.question?.additionalData?.js,
                },
              });
            }
            break;

          case "MCQ":
            ansArr.push({
              questionId: element?.question?.queId,
              answer: element?.question?.ans?.pickedAns,
              additionalData: {
                html: element?.question?.additionalData?.html,
                css: element?.question?.additionalData?.css,
                js: element?.question?.additionalData?.js,
              },
            });
            break;

          case "CHECKBOX":
            ansArr.push({
              questionId: element?.question?.queId,
              answer:
                typeof element?.question?.ans?.checkedAns === "string"
                  ? element?.question?.ans?.checkedAns
                  : element?.question?.ans?.checkedAns
                      ?.filter(
                        (v) => v !== undefined && v !== false
                        // empty &&
                      )
                      .join(","),
              additionalData: {
                html: element?.question?.additionalData?.html,
                css: element?.question?.additionalData?.css,
                js: element?.question?.additionalData?.js,
              },
            });
            break;

          case "TEXT":
            ansArr.push({
              questionId: element?.question?.queId,
              answer: element?.question?.ans?.textAns,
              additionalData: {
                html: element?.question?.additionalData?.html,
                css: element?.question?.additionalData?.css,
                js: element?.question?.additionalData?.js,
              },
            });
            break;

          default:
            break;
        }
      }

      let projectData = {
        submissionType: "DRAFT",
        answers: ansArr,
        // answers: values?.mainAns,
      };

      if (isNewAssignmentSubmitted === true) {
        const res = await axios.put(
          `${EXPRESS_API_BASE_URL}/course/${courseId}/assignment/${parseInt(
            id
          )}`,
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const res = await axios.post(
          `${EXPRESS_API_BASE_URL}/course/${courseId}/assignment/${parseInt(
            id
          )}`,
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // console.log("res", res);
      toast.success("Assignment saved as draft successfully!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      navigate(`/student/my-assignments`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("onSaveAsDraft assignment error", error);
    }
  };

  // on submit
  const onSubmit = async (values, e) => {
    e.preventDefault();
    setIsBtnCalling(true);

    try {
      setLoading(true);
      let ansArr = [];
      for (let index = 0; index < values?.mainAns.length; index++) {
        const element = values?.mainAns[index];

        switch (element?.type) {
          case "CODE":
            if (element?.answerFormat === "HTML") {
              ansArr.push({
                questionId: element?.question?.queId,
                answer: element?.question?.ans?.htmlAns,
                additionalData: {
                  html: element?.question?.additionalData?.html,
                  css: element?.question?.additionalData?.css,
                  js: element?.question?.additionalData?.js,
                },
              });
            } else if (
              element?.answerFormat === "PYTHON" ||
              element?.answerFormat === "JAVA"
            ) {
              ansArr.push({
                questionId: element?.question?.queId,
                answer: element?.question?.ans?.codeAns,
                additionalData: {
                  html: element?.question?.additionalData?.html,
                  css: element?.question?.additionalData?.css,
                  js: element?.question?.additionalData?.js,
                },
              });
            }
            break;

          case "MCQ":
            ansArr.push({
              questionId: element?.question?.queId,
              answer: element?.question?.ans?.pickedAns,
              additionalData: {
                html: element?.question?.additionalData?.html,
                css: element?.question?.additionalData?.css,
                js: element?.question?.additionalData?.js,
              },
            });
            break;

          case "CHECKBOX":
            ansArr.push({
              questionId: element?.question?.queId,
              answer:
                typeof element?.question?.ans?.checkedAns === "string"
                  ? element?.question?.ans?.checkedAns
                  : element?.question?.ans?.checkedAns
                      ?.filter(
                        (v) => v !== undefined && v !== false
                        // empty &&
                      )
                      .join(","),
              additionalData: {
                html: element?.question?.additionalData?.html,
                css: element?.question?.additionalData?.css,
                js: element?.question?.additionalData?.js,
              },
            });
            break;

          case "TEXT":
            ansArr.push({
              questionId: element?.question?.queId,
              answer: element?.question?.ans?.textAns,
              additionalData: {
                html: element?.question?.additionalData?.html,
                css: element?.question?.additionalData?.css,
                js: element?.question?.additionalData?.js,
              },
            });
            break;

          default:
            break;
        }
      }

      let projectData = {
        submissionType: "SUBMITTED",
        answers: ansArr,
      };
      // console.log("SUBMITTED projectData", projectData);

      // const res = await axios.post(
      //   `${EXPRESS_API_BASE_URL}/course/${courseId}/assignment/${parseInt(id)}`,
      //   projectData,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      if (isNewAssignmentSubmitted === true) {
        const res = await axios.put(
          `${EXPRESS_API_BASE_URL}/course/${courseId}/assignment/${parseInt(
            id
          )}`,
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const res = await axios.post(
          `${EXPRESS_API_BASE_URL}/course/${courseId}/assignment/${parseInt(
            id
          )}`,
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // console.log("res", res);
      toast.success("Successfully submitted assignment!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      navigate(`/student/my-assignments`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("onSubmit assignment error", error);
    }
  };

  // calculation for toal of marks and total marks
  useEffect(() => {
    // console.log("afterAnsAttemptArr", afterAnsAttemptArr);

    if (afterAnsAttemptArr) {
      if (
        afterAnsAttemptArr[0]?.submissionType === "REVIEWED" &&
        (afterAnsAttemptArr[0]?.score !== "" ||
          afterAnsAttemptArr[0]?.score !== 0)
      ) {
        // total of score
        let newArr = afterAnsAttemptArr.map((s) => {
          return parseInt(s?.score);
        });
        const sum = newArr.reduce((v, a) => v + a, 0);
        setTotalMarksGot(sum);

        // total marks
        let newTMArr = afterAnsAttemptArr.map((s) => {
          return parseInt(s?.maxScore);
        });
        const TM = newTMArr.reduce((v, a) => v + a, 0);
        setTotalMarks(TM);
      }
    }
  }, [afterAnsAttemptArr]);

  return (
    <div className="w-full">
      {loading === true ? (
        <Loader />
      ) : (
        <Formik
          initialValues={{
            mainAns: afterAnsAttemptArr,
          }}
          enableReinitialize
          onSubmit={async (values) => {}}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="w-full mx-auto flex justify-center items-center pb-10 preventPageCopyPaste">
                <div className={`w-11/12`}>
                  <div className="bg-secondary pt-32 laptop:pt-28 ipad:pt-36 mobile:pt-28">
                    <div className="w-full flex justify-end">
                      {/* <div className="w-3/5 laptop:w-8/12 flex justify-between mobile:flex-col ipad:w-full mobile:w-full"> */}
                      <div className="w-full flex mobile:flex-col">
                        <p
                          className="text-3xl font-bold mobile:text-2xl break-words"
                          style={{
                            position: "relative",
                            left: width < 500 ? "" : "38%",
                            width: width < 500 ? "" : "60%",
                          }}
                        >
                          {assignmentDetailsData?.title}
                        </p>

                        {isTeacherLogin || isAdminLogin || !courseId ? (
                          <></>
                        ) : (
                          <div className="w-full flex justify-end items-center gap-5 mobile:mt-4 mobile:justify-center">
                            {isAssignmentSubmitted === true ? (
                              <FilledButton
                                onClickFilled={onDownload}
                                filledBtnText="Save as pdf"
                                loading={loading}
                                id="print"
                              />
                            ) : (
                              <div className="flex gap-5 mobile:mt-5 mobile:justify-center">
                                <UnFilledButton
                                  onClickUnFilled={(e) =>
                                    onSaveAsDraft(values, e)
                                  }
                                  unFilledBtnText="Save as draft"
                                  loading={loading}
                                />

                                <FilledButton
                                  onClickFilled={(e) => onSubmit(values, e)}
                                  filledBtnText="Submit"
                                  loading={loading}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-1/2 ipad:w-full mobile:w-full mx-auto">
                      <div className="w-full h-full flex justify-center items-center my-5">
                        <img
                          src={
                            assignmentDetailsData &&
                            assignmentDetailsData?.featureImage
                              ? assignmentDetailsData?.featureImage
                              : MainLogo
                          }
                          alt="assignmentImg"
                          // crossOrigin="true"
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

                  {assignmentDetailsData ? (
                    <div className="flex justify-center items-center mt-5">
                      <div
                        className="mt-3 w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full"
                        // style={{ width: isIpadMobile ? "100%" : "70%" }}
                      >
                        <p className="font-semibold my-2 flex justify-start">
                          Assignment description:
                        </p>
                        <div
                          className="w-full my-4 text-lg"
                          dangerouslySetInnerHTML={{
                            __html: assignmentDetailsData?.description,
                          }}
                        >
                          {/* <CKEditor
                            editor={ClassicEditor}
                            data={assignmentDetailsData?.description}
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
                  ) : (
                    <p
                      style={{
                        position: "absolute",
                        left: width < 500 ? "35%" : "42%",
                      }}
                      className="font-semibold text-xl py-10"
                    >
                      No data found!
                    </p>
                  )}

                  <div className="flex justify-center items-center">
                    <div className="w-full">
                      {values?.mainAns?.map((val, mainindex) => {
                        return (
                          <div className="" key={mainindex}>
                            <div className="w-full flex justify-center items-center">
                              <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                {val?.type === "MCQ" ? (
                                  <div>
                                    {/* <p className="text-2xl font-semibold my-2 mobile:text-lg">
                                      {`Q.${mainindex + 1} ${val?.text}`}
                                    </p> */}

                                    <div className="w-full my-3 flex items-center">
                                      <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                        mainindex + 1
                                      }`}</span>

                                      <div
                                        className="w-full text-2xl font-semibold mobile:text-lg"
                                        dangerouslySetInnerHTML={{
                                          __html: val?.text,
                                        }}
                                      >
                                        {/* <CKEditor
                                          editor={ClassicEditor}
                                          data={val?.text}
                                          disabled={true}
                                          config={{
                                            toolbar: [],
                                            isReadOnly: true,
                                          }}
                                        /> */}
                                      </div>
                                    </div>

                                    {isAssignmentSubmitted === true &&
                                    val?.comments ? (
                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Teacher's Remarks
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            disabled={true}
                                            style={{
                                              width: "100%",
                                            }}
                                            id="outlined-multiline-flexible"
                                            label="Comment"
                                            value={val?.comments}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            disabled={true}
                                            style={{
                                              width: "100%",
                                            }}
                                            id="outlined-multiline-flexible"
                                            label={`Marks out of ${val?.maxScore}`}
                                            type="number"
                                            value={val?.score}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}

                                    {isAdminLogin || isTeacherLogin ? (
                                      <div>
                                        <p className="w-full mt-3 text-xl font-semibold mobile:text-base">
                                          Correct Options:
                                        </p>
                                        <div className="border rounded-lg p-1 my-1">
                                          {val?.correctOption?.length >
                                          10000 ? (
                                            <img
                                              className="border"
                                              src={
                                                val?.correctOption?.length >
                                                10000
                                                  ? val?.correctOption.includes(
                                                      "data:image/png;base64,"
                                                    )
                                                    ? val?.correctOption
                                                    : `data:image/png;base64,${val?.correctOption}`
                                                  : val?.correctOption
                                              }
                                              alt={"uploaded option"}
                                              height="200px"
                                              width={"200px"}
                                            />
                                          ) : (
                                            <p className="w-full text-xl mobile:text-base">
                                              {val?.correctOption}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}

                                    <div className="border rounded-lg p-1 my-4">
                                      <RadioGroup
                                        value={val?.question?.ans?.pickedAns}
                                        onChange={(e) => {
                                          setFieldValue(
                                            `mainAns[${mainindex}].question.ans.pickedAns`,
                                            e.target.value
                                          );
                                          setIsOnChanged(true);
                                        }}
                                        name="picked"
                                      >
                                        {val?.options?.map((v, index) => {
                                          return (
                                            <div key={index}>
                                              <FormControlLabel
                                                control={
                                                  <Radio
                                                    disabled={
                                                      isAssignmentSubmitted ===
                                                        true ||
                                                      isAdminLogin ||
                                                      isTeacherLogin
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
                                                  val?.optionTypes[index] ===
                                                  "text" ? (
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
                                        })}
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
                                {val?.type === "CHECKBOX" ? (
                                  <div>
                                    <div className="w-full my-3 flex items-center">
                                      <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                        mainindex + 1
                                      }`}</span>

                                      <div
                                        className="w-full text-2xl font-semibold mobile:text-lg"
                                        dangerouslySetInnerHTML={{
                                          __html: val?.text,
                                        }}
                                      >
                                        {/* <CKEditor
                                          editor={ClassicEditor}
                                          data={val?.text}
                                          disabled={true}
                                          config={{
                                            toolbar: [],
                                            isReadOnly: true,
                                          }}
                                        /> */}
                                      </div>
                                    </div>

                                    {isAssignmentSubmitted === true &&
                                    val?.comments ? (
                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Teacher's Remarks
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            disabled={true}
                                            style={{
                                              width: "100%",
                                            }}
                                            id="outlined-multiline-flexible"
                                            label="Comment"
                                            value={val?.comments}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            disabled={true}
                                            style={{
                                              width: "100%",
                                            }}
                                            id="outlined-multiline-flexible"
                                            label={`Marks out of ${val?.maxScore}`}
                                            type="number"
                                            value={val?.score}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}

                                    {isAdminLogin || isTeacherLogin ? (
                                      <div>
                                        <p className="w-full mt-3 text-xl font-semibold mobile:text-base">
                                          Correct Options:
                                        </p>
                                        <div className="border rounded-lg p-1 my-1">
                                          {val?.correctOption
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
                                    ) : (
                                      <></>
                                    )}

                                    <div className="border rounded-lg p-1 my-4">
                                      <FormGroup>
                                        {val?.options?.map((v, i) => {
                                          return (
                                            <div key={i}>
                                              <FormControlLabel
                                                label={
                                                  val?.optionTypes[i] ===
                                                  "text" ? (
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
                                                        true ||
                                                      isAdminLogin ||
                                                      isTeacherLogin
                                                        ? true
                                                        : false
                                                    }
                                                    sx={{
                                                      color: "#006b5c",
                                                      "&.Mui-checked": {
                                                        color: "#006b5c",
                                                      },
                                                    }}
                                                    checked={val?.question?.ans?.checkedAns.includes(
                                                      v
                                                    )}
                                                    name="checked"
                                                    value={v}
                                                    onChange={(e) => {
                                                      setFieldValue(
                                                        `mainAns[${mainindex}].question.ans.checkedAns[${i}]`,
                                                        e.target.checked ===
                                                          true
                                                          ? v
                                                          : false
                                                      );
                                                      setIsOnChanged(true);
                                                    }}
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
                                {val?.type === "TEXT" ? (
                                  <div>
                                    <div className="w-full my-3 flex items-center">
                                      <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                        mainindex + 1
                                      }`}</span>

                                      <div
                                        className="w-full text-2xl font-semibold mobile:text-lg"
                                        dangerouslySetInnerHTML={{
                                          __html: val?.text,
                                        }}
                                      >
                                        {/* <CKEditor
                                          editor={ClassicEditor}
                                          data={val?.text}
                                          disabled={true}
                                          config={{
                                            toolbar: [],
                                            isReadOnly: true,
                                          }}
                                        /> */}
                                      </div>
                                    </div>

                                    {isAssignmentSubmitted === true &&
                                    val?.comments ? (
                                      <div className="teachers-remarks">
                                        <div className="text-lg">
                                          Teacher's Remarks
                                        </div>
                                        <div className="my-4">
                                          <TextField
                                            disabled={true}
                                            style={{
                                              width: "100%",
                                            }}
                                            id="outlined-multiline-flexible"
                                            label="Comment"
                                            value={val?.comments}
                                          />
                                        </div>

                                        <div className="">
                                          <TextField
                                            disabled={true}
                                            style={{
                                              width: "100%",
                                            }}
                                            id="outlined-multiline-flexible"
                                            label={`Marks out of ${val?.maxScore}`}
                                            type="number"
                                            value={val?.score}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}

                                    <div className="mt-4">
                                      <TextField
                                        disabled={
                                          isAssignmentSubmitted === true ||
                                          isAdminLogin ||
                                          isTeacherLogin
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
                                        value={val?.question?.ans?.textAns}
                                        onChange={(e) => {
                                          setFieldValue(
                                            `mainAns[${mainindex}].question.ans.textAns`,
                                            e.target.value
                                          );
                                          setIsOnChanged(true);
                                        }}
                                        onCut={(e) => {
                                          e.preventDefault();
                                        }}
                                        onCopy={(e) => {
                                          e.preventDefault();
                                        }}
                                        onPaste={(e) => {
                                          e.preventDefault();
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            <div>
                              {val?.answerFormat !== "HTML" &&
                              val?.type === "CODE" &&
                              val?.answerFormat !== "SCRATCH" ? (
                                <div className="w-full">
                                  <div className="flex justify-center items-center">
                                    <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                      <div className="w-full my-3 flex items-center">
                                        <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                          mainindex + 1
                                        }`}</span>

                                        <div
                                          className="w-full text-2xl font-semibold mobile:text-lg"
                                          dangerouslySetInnerHTML={{
                                            __html: val?.text,
                                          }}
                                        >
                                          {/* <CKEditor
                                            editor={ClassicEditor}
                                            data={val?.text}
                                            disabled={true}
                                            config={{
                                              toolbar: [],
                                              isReadOnly: true,
                                            }}
                                          /> */}
                                        </div>
                                      </div>

                                      {isAssignmentSubmitted === true &&
                                      val?.comments ? (
                                        <div className="teachers-remarks">
                                          <div className="text-lg">
                                            Teacher's Remarks
                                          </div>
                                          <div className="my-4">
                                            <TextField
                                              disabled={true}
                                              style={{
                                                width: "100%",
                                              }}
                                              id="outlined-multiline-flexible"
                                              label="Comment"
                                              value={val?.comments}
                                            />
                                          </div>

                                          <div className="">
                                            <TextField
                                              disabled={true}
                                              style={{
                                                width: "100%",
                                              }}
                                              id="outlined-multiline-flexible"
                                              label={`Marks out of ${val?.maxScore}`}
                                              type="number"
                                              value={val?.score}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                  </div>

                                  <div className="w-full flex justify-center items-center mt-4">
                                    <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                      <div className="flex flex-row ipad:flex-col mobile:flex-col">
                                        <div className="h-450 w-1/2 ipad:w-full mobile:w-full ipad:mb-12 mobile:mb-12">
                                          <div className="controls">
                                            {val?.question?.ans?.codeAns
                                              ?.length > 0 ? (
                                              <button
                                                onClick={(e) =>
                                                  onRunClick(
                                                    val?.answerFormat ===
                                                      "PYTHON"
                                                      ? 71
                                                      : 62,
                                                    e,
                                                    val?.question?.ans?.codeAns
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
                                              isAssignmentSubmitted === true ||
                                              isAdminLogin ||
                                              isTeacherLogin
                                                ? true
                                                : false
                                            }
                                            // onLoad={onLoad}
                                            onChange={(e) => {
                                              setFieldValue(
                                                `mainAns[${mainindex}].question.ans.codeAns`,
                                                e
                                              );
                                              setCode(e);
                                              setIsOnChanged(true);
                                            }}
                                            fontSize={16}
                                            showPrintMargin={true}
                                            showGutter={true}
                                            highlightActiveLine={true}
                                            value={val?.question?.ans?.codeAns}
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
                              {val?.answerFormat === "HTML" &&
                              val?.type === "CODE" &&
                              val?.answerFormat !== "SCRATCH" ? (
                                <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                  <div className="flex justify-center items-center">
                                    <div className="w-full">
                                      <div className="w-full my-3 flex items-center">
                                        <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                          mainindex + 1
                                        }`}</span>

                                        <div
                                          className="w-full text-2xl font-semibold mobile:text-lg"
                                          dangerouslySetInnerHTML={{
                                            __html: val?.text,
                                          }}
                                        >
                                          {/* <CKEditor
                                            editor={ClassicEditor}
                                            data={val?.text}
                                            disabled={true}
                                            config={{
                                              toolbar: [],
                                              isReadOnly: true,
                                            }}
                                          /> */}
                                        </div>
                                      </div>

                                      {isAssignmentSubmitted === true &&
                                      val?.comments ? (
                                        <div className="teachers-remarks">
                                          <div className="text-lg">
                                            Teacher's Remarks
                                          </div>
                                          <div className="my-4">
                                            <TextField
                                              disabled={true}
                                              style={{
                                                width: "100%",
                                              }}
                                              id="outlined-multiline-flexible"
                                              label="Comment"
                                              value={val?.comments}
                                            />
                                          </div>

                                          <div className="">
                                            <TextField
                                              disabled={true}
                                              style={{
                                                width: "100%",
                                              }}
                                              id="outlined-multiline-flexible"
                                              label={`Marks out of ${val?.maxScore}`}
                                              type="number"
                                              value={val?.score}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
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
                                          value={
                                            val?.question?.additionalData?.html
                                          }
                                          onBeforeChange={(
                                            editor,
                                            data,
                                            value,
                                            change
                                          ) => {
                                            // if (change.origin === "paste")
                                            //   change.cancel();

                                            setFieldValue(
                                              `mainAns[${mainindex}].question.additionalData.html`,
                                              value
                                            );
                                            setFieldValue(
                                              `mainAns[${mainindex}].question.ans.htmlAns`,
                                              "HTML"
                                            );
                                            // setHTML(value);
                                            setIsOnChanged(true);
                                          }}
                                          className="code-mirror-wrapper"
                                          options={{
                                            readOnly:
                                              isAssignmentSubmitted === true ||
                                              isAdminLogin ||
                                              isTeacherLogin
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
                                          value={
                                            val?.question?.additionalData?.css
                                          }
                                          onBeforeChange={(
                                            editor,
                                            data,
                                            value
                                          ) => {
                                            setFieldValue(
                                              `mainAns[${mainindex}].question.additionalData.css`,
                                              value
                                            );
                                            setFieldValue(
                                              `mainAns[${mainindex}].question.ans.htmlAns`,
                                              "HTML"
                                            );
                                            // setCSS(value);
                                            setIsOnChanged(true);
                                          }}
                                          className="code-mirror-wrapper"
                                          options={{
                                            readOnly:
                                              isAssignmentSubmitted === true ||
                                              isAdminLogin ||
                                              isTeacherLogin
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
                                          value={
                                            val?.question?.additionalData?.js
                                          }
                                          onBeforeChange={(
                                            editor,
                                            data,
                                            value
                                          ) => {
                                            setFieldValue(
                                              `mainAns[${mainindex}].question.additionalData.js`,
                                              value
                                            );
                                            setFieldValue(
                                              `mainAns[${mainindex}].question.ans.htmlAns`,
                                              "HTML"
                                            );
                                            // setJS(value);
                                            setIsOnChanged(true);
                                          }}
                                          className="code-mirror-wrapper"
                                          options={{
                                            readOnly:
                                              isAssignmentSubmitted === true ||
                                              isAdminLogin ||
                                              isTeacherLogin
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
                                        {val?.question?.additionalData?.html
                                          ?.length > 0 ? (
                                          <button
                                            onClick={(e) =>
                                              hanldeRunHtmlCode(
                                                e,
                                                val?.question?.additionalData
                                                  ?.html,
                                                val?.question?.additionalData
                                                  ?.css,
                                                val?.question?.additionalData
                                                  ?.js
                                              )
                                            }
                                            className={`font-semibold bg-primary px-2 text-white rounded-md h-8`}
                                          >
                                            RUN
                                          </button>
                                        ) : (
                                          <></>
                                        )}

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
                              {val?.type === "FILE" ||
                              (val?.type === "CODE" &&
                                val?.answerFormat === "SCRATCH") ? (
                                <div className="w-full">
                                  <div className="flex justify-center items-center">
                                    <div className="w-3/5 laptop:w-4/5 ipad:w-full mobile:w-full">
                                      <div className="w-full my-3 flex items-center">
                                        <span className="text-2xl font-semibold mr-2 mobile:text-lg">{`Q.${
                                          mainindex + 1
                                        }`}</span>

                                        <div
                                          className="w-full text-2xl font-semibold mobile:text-lg"
                                          dangerouslySetInnerHTML={{
                                            __html: val?.text,
                                          }}
                                        >
                                          {/* <CKEditor
                                            editor={ClassicEditor}
                                            data={val?.text}
                                            disabled={true}
                                            config={{
                                              toolbar: [],
                                              isReadOnly: true,
                                            }}
                                          /> */}
                                        </div>
                                      </div>

                                      {isAssignmentSubmitted === true &&
                                      val?.comments ? (
                                        <div className="teachers-remarks">
                                          <div className="text-lg">
                                            Teacher's Remarks
                                          </div>
                                          <div className="my-4">
                                            <TextField
                                              disabled={true}
                                              style={{
                                                width: "100%",
                                              }}
                                              id="outlined-multiline-flexible"
                                              label="Comment"
                                              value={val?.comments}
                                            />
                                          </div>

                                          <div className="">
                                            <TextField
                                              disabled={true}
                                              style={{
                                                width: "100%",
                                              }}
                                              id="outlined-multiline-flexible"
                                              label={`Marks out of ${val?.maxScore}`}
                                              type="number"
                                              value={val?.score}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      )}
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

export default AttemptAssignment;
