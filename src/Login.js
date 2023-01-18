import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import textfieldCross from "../assets/icons/textfieldCross.png";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "universal-cookie";
import { EXPRESS_API_BASE_URL } from "../constant";

const Login = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const inputType = visible ? "text" : "password";

  useEffect(() => {
    if (cookies.get("token")) {
      if (cookies.get("isStudentLogin")) {
        navigate("/student/my-studies");
      } else if (cookies.get("isTeacherLogin")) {
        navigate("/course");
      } else if (cookies.get("isAdminLogin")) {
        navigate("/");
      } else {
        return;
      }
    } else {
      navigate("/login");
    }
  }, []);

  const handleLogin = async () => {
    try {
      if (userName.length >= 3 && password.length >= 5) {
        setLoading(true);
        const LoginData = {
          username: userName,
          password: password,
        };

        const res = await axios.post(
          `${EXPRESS_API_BASE_URL}/users/login`,
          LoginData
        );

        console.log("LoginRes", res.data);

        if (res.data) {
          cookies.set("token", res.data.token);
          localStorage.setItem("userData", JSON.stringify(res.data.user));
          if (localStorage.getItem("FCM_TOKEN")) {
            axios
              .post(
                `${EXPRESS_API_BASE_URL}/users/register-fcm`,
                {
                  fcmToken: localStorage.getItem("FCM_TOKEN"),
                },
                {
                  headers: {
                    Authorization: "Bearer " + res.data.token,
                  },
                }
              )
              .then((res) => {
                console.log(res.data);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }

        if (res.data.user.role.type === "STUDENT") {
          cookies.set("isStudentLogin", true);
          navigate("/student/my-studies");
        }

        if (res.data.user.role.type === "TEACHER") {
          cookies.set("isTeacherLogin", true);
          navigate("/course");
        }

        if (res.data.user.role.type === "ADMIN") {
          cookies.set("isAdminLogin", true);
          navigate("/");
        }

        window.location.reload();
        setLoading(false);
      } else {
        setLoading(false);
        toast.error("Username and Password required!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      }
    } catch (error) {
      setLoading(false);
      console.log("Login error", error);
    }
  };

  // // get profile details
  // const getDetails = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(`${EXPRESS_API_BASE_URL}/users/me`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     console.log("get profile details res", res.data.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     console.log("get profile details error", error);
  //   }
  // };

  // useEffect(() => {
  //   getDetails();
  // }, []);

  return (
    <div className="flex justify-center items-center absolute top-20 w-full ipad:top-32">
      <div className="w-2/5 mobile:w-4/5 ipad:w-1/2 mx-auto mt-10">
        <div className="mt-5">
          <TextField
            style={{ width: "100%" }}
            id="outlined-multiline-flexible"
            label="Username"
            InputProps={{
              endAdornment:
                userName && userName.length >= 1 ? (
                  <button onClick={() => setUserName("")}>
                    <img src={textfieldCross} alt="cross" />
                  </button>
                ) : null,
            }}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        <div className="mt-5">
          <TextField
            style={{ width: "100%" }}
            id="outlined-multiline-flexible"
            label="Password"
            type={inputType}
            InputProps={{
              endAdornment:
                password && password.length >= 1 ? (
                  <button onClick={() => setVisible((visibilty) => !visibilty)}>
                    {visible ? (
                      <AiOutlineEyeInvisible className="text-2xl opacity-80" />
                    ) : (
                      <AiOutlineEye className="text-2xl opacity-80" />
                    )}
                  </button>
                ) : null,
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="my-5 w-full flex justify-center items-center">
          <button
            onClick={handleLogin}
            disabled={loading === true ? true : false}
            className="border border-primary bg-primary text-white text-center rounded-xl py-2 w-full"
          >
            {loading === true ? "Loading..." : "LOGIN"}
          </button>
        </div>

        {/* <div className="mt-5 flex justify-center items-center">
          <FilledButton onClickFilled={handleLogin} filledBtnText="LOGIN" />
        </div> */}
      </div>
    </div>
  );
};

export default Login;
