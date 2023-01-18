import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AssignmentCard from "../../customs/AssignmentCard";
import Cookies from "universal-cookie";
import Loader from "../../customs/Loader";
import { EXPRESS_API_BASE_URL } from "../../constant";
import MainLogo from "../../assets/MainLogo.png";

const ListAttemptAssignment = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState([]);
  let token = cookies.get("token");

  const getCoursesData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${EXPRESS_API_BASE_URL}/course/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("courses", res.data.data);
      setCoursesData(res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("get my courses error", error);
    }
  };

  useEffect(() => {
    getCoursesData();
  }, []);

  const newFunt = async () => {
    if (coursesData) {
      let newAr = [];
      for (let index = 0; index < coursesData.length; index++) {
        const element = coursesData[index];
        let assignmentArr = [];
        for (let i = 0; i < element?.assignments.length; i++) {
          const newElement = element?.assignments[i];

          let newRes = await axios.get(
            `${EXPRESS_API_BASE_URL}/course/${parseInt(
              newElement?.CourseId
            )}/assignment/${parseInt(newElement?.assignmentId)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          assignmentArr.push(
            newRes?.data.data?.length === 0
              ? "NEW"
              : newRes?.data.data[0] &&
                newRes?.data.data[0]?.submission &&
                newRes?.data.data[0]?.submission[0] &&
                newRes?.data.data[0]?.submission[0]?.submissionType
              ? newRes?.data.data[0]?.submission[0]?.submissionType
              : "NEW"
          );
        }
        newAr.push(assignmentArr);
      }
      setSubmissionStatus(newAr);
      // console.log("newAr", newAr);
    }
  };

  useEffect(() => {
    newFunt();
  }, [coursesData]);

  return (
    <>
      {loading === true ? (
        <Loader />
      ) : (
        <div className="flex w-4/5 mobile:w-full ipad:w-full position-class pb-10">
          <div className="flex flex-col mb-5 w-full">
            <div className="bg-secondary flex justify-between items-center py-5 px-5 stickyNavbar z-40">
              <p className="text-2xl font-semibold">Assignments</p>
            </div>

            <div className="px-5">
              {coursesData?.map((val, index) => {
                let header = coursesData[index]?.name?.toUpperCase();

                return (
                  <div key={index}>
                    <div className="mt-5">
                      <h1 className="text-2xl font-semibold uppercase">
                        {header?.includes("HTML")
                          ? "HTML"
                          : header?.includes("SCRATCH")
                          ? "Scratch"
                          : header?.includes("JAVA")
                          ? "Java"
                          : header?.includes("PYTHON")
                          ? "Python"
                          : "Others"}
                      </h1>

                      <div className="flex mobile:justify-center">
                        <div className="flex flex-wrap gap-5 ipad:justify-start mobile:justify-start mobile:w-full">
                          {val?.assignments?.map((newVal, assignmentIndex) => {
                            return (
                              <div key={assignmentIndex}>
                                <AssignmentCard
                                  imageClassname="assignment-card-image-width"
                                  courseImg={
                                    newVal?.assignment?.featureImage
                                      ? newVal?.assignment?.featureImage
                                      : MainLogo
                                  }
                                  Title={`${newVal?.assignment?.title}`}
                                  Desc={`${newVal?.assignment?.description}`}
                                  unFilledBtnText={
                                    submissionStatus[index] &&
                                    submissionStatus[index][assignmentIndex] ===
                                      "REVIEWED"
                                      ? "View Evaluation"
                                      : submissionStatus[index] &&
                                        submissionStatus[index][
                                          assignmentIndex
                                        ] === "SUBMITTED"
                                      ? "View"
                                      : submissionStatus[index] &&
                                        submissionStatus[index][
                                          assignmentIndex
                                        ] === "NEW"
                                      ? "Start Assignment"
                                      : submissionStatus[index] &&
                                        submissionStatus[index][
                                          assignmentIndex
                                        ] === "DRAFT"
                                      ? "Resume Assignment"
                                      : "Edit"
                                  }
                                  onClickUnFilled={() =>
                                    navigate(
                                      `/student/my-assignments-details/${parseInt(
                                        newVal?.assignment?.id
                                      )}`,
                                      {
                                        state: {
                                          courseId: val?.id,
                                          submissionStatusParam:
                                            submissionStatus[index][
                                              assignmentIndex
                                            ],
                                        },
                                      }
                                    )
                                  }
                                  loading={loading}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
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

export default ListAttemptAssignment;
