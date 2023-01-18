import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { EXPRESS_API_BASE_URL } from "../../constant";
import AssignmentCard from "../../customs/AssignmentCard";
import Loader from "../../customs/Loader";
import MainLogo from "../../assets/MainLogo.png";
import useWindowSize from "../../constants/UseWindowSize";

const ListEvaluateAssignments = () => {
  const cookies = new Cookies();
  const { id } = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [loading, setLoading] = useState(false);
  const [isDataAvailable, setisDataAvailable] = useState(false);
  const [submittedAssignmentsArr, setSubmittedAssignmentsArr] = useState([]);
  let token = cookies.get("token");
  let paramId = id;

  // get submitted assignments dynamic list
  const getSubmittedAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${EXPRESS_API_BASE_URL}/course/${parseInt(id)}/assignment/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmittedAssignmentsArr(res.data.data);
      setLoading(false);
      // console.log("getSubmittedAssignmentsRes", res.data.data);
    } catch (error) {
      setLoading(false);
      console.log("getSubmittedAssignments error", error.response.data.message);
    }
  };

  useEffect(() => {
    getSubmittedAssignments();
  }, []);

  useEffect(() => {
    if (submittedAssignmentsArr?.length === 0) {
      setisDataAvailable(true);
    } else {
      setisDataAvailable(false);
    }
  }, [submittedAssignmentsArr]);

  return (
    <>
      {loading === true ? (
        <Loader />
      ) : (
        <div className="w-4/5 mobile:w-full ipad:w-full position-class pb-10">
          {isDataAvailable === true ? (
            <p
              style={{
                position: "absolute",
                left: width < 500 ? "35%" : "40%",
              }}
              className="font-semibold text-xl pt-60"
            >
              No data found!
            </p>
          ) : (
            <div>
              <div className="bg-secondary flex items-center py-5 px-5 stickyNavbar z-40">
                <p className="text-3xl font-semibold">Submitted assignments</p>
              </div>
              <div className="flex mobile:justify-center px-5 py-4">
                <div className="flex flex-wrap gap-5 ipad:justify-start mobile:w-full">
                  {submittedAssignmentsArr?.map((val, index) => {
                    return (
                      <div key={index}>
                        <AssignmentCard
                          imageClassname="assignment-card-image-width"
                          courseImg={
                            val?.assignment?.featureImage
                              ? val?.assignment?.featureImage
                              : MainLogo
                          }
                          Title={`${val?.assignment?.title}`}
                          Desc={`${val?.assignment?.description}`}
                          // unFilledBtnText="Details"
                          onClickDiv={() =>
                            navigate(
                              `/teacher/assignment/submissions/course/${parseInt(
                                id
                              )}/assignment/${val.assignment.id}/student/${
                                val.student.id
                              }`,
                              {
                                state: {
                                  assignmentDetailsRes: val,
                                  courseid: paramId,
                                },
                              }
                            )
                          }
                          loading={loading}
                          CreatedBy={val?.student?.username}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ListEvaluateAssignments;
