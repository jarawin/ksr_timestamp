import { useState, useEffect } from "react";
import liff from "@line/liff";
import axios from "axios";
import { MdCancel } from "react-icons/md";
import { ImSpinner9 } from "react-icons/im";
import { AiFillCheckCircle } from "react-icons/ai";

import haversineDistance from "./utils/haversineDistance.js";
import { getTimestampFlex } from "./flex/timestamp.js";
import RegisterEmployeePage from "./components/RegisterEmployeePage.js";

// const variable
const Liff_id = "1661054554-bMmJz7AG";
const Shop_Location = {
  lat: 7.152188,
  lon: 100.601831,
};
const Url_base =
  "https://script.google.com/macros/s/AKfycbzXybQCT82jqKSoJaY-Kc7JRvvXrjQS0y1Gwlmf3KSpBb3ojlnH0efxCp6QhFY8osrRMg/exec";

function App() {
  // line data
  const [pictureUrl, setPictureUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [userId, setUserId] = useState("");

  const logout = () => {
    liff.logout();
    window.location.reload();
  };

  const initLine = async () => {
    await liff.init(
      { liffId: Liff_id },
      async () => {
        if (liff.isLoggedIn()) {
          await runApp();
          setStep(2);
        } else {
          setStepFail(1);
          liff.login();
        }
      },
      (err) => console.error(err)
    );
  };

  const runApp = async () => {
    try {
      const profile = await liff.getProfile();
      saveProfile(profile);
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = (profile) => {
    setPictureUrl(profile.pictureUrl);
    setDisplayName(profile.displayName);
    setStatusMessage(profile.statusMessage);
    setUserId(profile.userId);

    localStorage.setItem("pictureUrl", profile.pictureUrl);
    localStorage.setItem("displayName", profile.displayName);
    localStorage.setItem("statusMessage", profile.statusMessage);
    localStorage.setItem("userId", profile.userId);
  };

  // location handle
  const [location, setLocation] = useState({ lat: 0, lon: 0 });
  const [distance, setDistance] = useState(99999);
  const [error, setError] = useState(null);

  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    });
  };

  const requestLocation = async () => {
    try {
      const position = await getLocation();
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      setError(null);
    } catch (err) {
      setError(err);
      // Retry after 3 seconds
      alert("cannot get location.");
      setTimeout(() => requestLocation(), 3000);
    }
  };

  const isAcceptLocation = (locat) => {
    // const Distance_Accept = 0.3;
    const Distance_Accept = 2000;

    let dt = haversineDistance(
      Shop_Location.lat,
      Shop_Location.lon,
      locat.lat,
      locat.lon
    );
    setDistance(dt);

    if (dt <= Distance_Accept) {
      return true;
    }

    console.log(`distance = ${dt} (${dt <= Distance_Accept})`);
  };

  // sheet data
  const [nickName, setNickName] = useState("");
  const [timestamp, setSetTimestamp] = useState("");
  const [shopIsOpen, setShopIsOpen] = useState(true);

  const findTimestamp = (timestamps) => {
    for (let i = 0; i < timestamps.length; i++) {
      let uid = timestamps[i].userid;

      if (uid == userId) {
        return timestamps[i];
      }
    }
  };

  const promiseTimeout = (delayms) => {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, delayms);
    });
  };

  const getTimestamps = async () => {
    const res = await axios.get(`${Url_base}?call=get-timestamps`);
    setShopIsOpen(res.data.data.status == "open");
    return findTimestamp(res.data.data.timestamps);
  };

  // website display
  const [textTimestamp, setTextTimestamp] = useState("ตอกบัตร");
  const [textAnnounce, setTextAnnounce] = useState("");

  const handleTextTimestamp = () => {
    switch (timestamp) {
      case "":
        setTextTimestamp("ตอกบัตรเข้างาน");
        break;
      case "workin":
        setTextTimestamp("ตอกบัตรออกงาน");
        break;
      case "workout":
        setTextTimestamp("คุณตอกบัตรแล้ว");
        break;
      case "workleave":
        setTextTimestamp("คุณลางานแล้ว");
        break;
    }
  };

  const handleTextAnnounce = () => {
    if (!shopIsOpen) {
      setTextAnnounce("วันนี้ร้านปิด");
    }
  };

  // website step render
  const [isFetching, setIsFetching] = useState(false);
  const [step, setStep] = useState(0);
  const [stepFail, setStepFail] = useState(-1);

  const step0_getLocation = async () => {
    //? awaiting for consent and get location.
    console.log("0.1 waiting for consent GPS...");
    await requestLocation();
    console.log("0.2 got location.");

    console.log("0.3 check near location.");
    setLocation((prev) => {
      if (isAcceptLocation(prev)) {
        console.log("0.3.1 accepted location.");
        setStep(1);
      } else {
        console.log("0.3.2 not accept location.");
        setStepFail(0);
        return;
      }
      return prev;
    });
  };

  const step1_fetchLineData = async () => {
    //? fetch data form line.
    setIsFetching(true);
    console.log("1.1 start fetching to line...");
    await initLine();
    console.log("1.2 fetched data from line.");
    setIsFetching(false);
  };

  const step2_fetchSheetData = async () => {
    // fetch data from sheet.
    setIsFetching(true);
    console.log("2.1 start fetching to sheet...");
    let timestamp = await getTimestamps();

    if (!timestamp) {
      // no user in sheet
      console.log("2.1.1 no user in sheet");
      setStepFail(2);
      return;
    }

    setSetTimestamp(timestamp.status);
    setNickName(timestamp.nickname);

    console.log("2.2 fetched data from sheet.");
    setIsFetching(false);
    setStep(3);
  };

  const step3_setDisplayText = async () => {
    // set text website diaplay.
    console.log("3.1 seting text...");
    await promiseTimeout(500);
    handleTextTimestamp();
    handleTextAnnounce();
    console.log("3.2 seted text.");

    setStep(4);
    // ready.
    await promiseTimeout(300);
    setStep(5);
  };

  useEffect(() => {
    switch (step) {
      case 0:
        step0_getLocation();
        break;
      case 1:
        step1_fetchLineData();
        break;
      case 2:
        step2_fetchSheetData();
        break;
      case 3:
        step3_setDisplayText();
        break;
    }
  }, [step]);

  useEffect(() => {
    setStep(0);
  }, []);

  // feature actions

  const sendMsg = async (state) => {
    let flex = getTimestampFlex(
      location.lat,
      location.lon,
      distance,
      timestamp
    );

    if (state) {
      await liff.sendMessages([flex]);
    } else {
      await liff.sendMessages([
        {
          type: "text",
          text: "ตอกบัตรเข้างานไม่สำเร็จ",
        },
      ]);
    }

    liff.closeWindow();
  };

  const findNextStatus = () => {
    if (timestamp == "") {
      return "workin";
    } else {
      return "workout";
    }
  };

  const handleWorkIn = async () => {
    setIsFetching(true);
    let nextStatus = findNextStatus();
    let param = `&userid=${userId}&status=${nextStatus}&lat=${location.lat}&lon=${location.lon}`;

    try {
      const res = await axios.get(`${Url_base}?call=set-timestamp${param}`);

      if (liff.isInClient()) {
        if (res.data.status == 200) {
          await sendMsg(true);
        } else {
          await sendMsg(false);
        }
      } else {
        alert("timestamp success.");
      }
    } catch (err) {
      alert("timestamp error.");
    }

    setIsFetching(false);
  };

  const handleWorkLeave = () => {
    setIsFetching(true);
    alert("ระบบจะพร้อมให้ใช้งานเร็วๆนี้!");
    setIsFetching(false);
  };

  // icon components

  const IconSuccess = (
    <AiFillCheckCircle className="w-6 h-6 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" />
  );

  const IconLoading = (
    <ImSpinner9 className="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
  );

  const IconFail = (
    <MdCancel className="w-6 h-6 mr-1.5 text-red-500 dark:text-red-400 flex-shrink-0" />
  );

  // shop close page

  // register employee page
  if (stepFail == 2) {
    return (
      <RegisterEmployeePage
        userId={userId}
        location={location}
        Url_base={Url_base}
      />
    );
  }

  // stepper load checking
  if (step < 5) {
    return (
      <div className="ml-10 mt-5">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          System is processing..
        </h2>
        <ul className=" mx-auto max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400">
          <li className="flex items-center">
            {stepFail != 0 ? (step < 1 ? IconLoading : IconSuccess) : IconFail}
            {stepFail == 0
              ? `You are ${
                  Math.floor(distance * 100) / 100
                } KM away from ksr car clean.`
              : step < 1
              ? "Are you really at ksr car clean."
              : "Of course you are at ksr car clean."}
          </li>
          <li className="flex items-center">
            {stepFail != 1 ? (step < 2 ? IconLoading : IconSuccess) : IconFail}
            {step < 2 ? "I want to know who you are." : `Hello ${displayName}.`}
          </li>
          <li className="flex items-center">
            {stepFail != 2 ? (step < 3 ? IconLoading : IconSuccess) : IconFail}
            {step < 3
              ? "We must ensure that you are our employees."
              : `Oh, here you are, ${nickName} for sure.`}
          </li>
          <li className="flex items-center">
            {stepFail != 3 ? (step < 4 ? IconLoading : IconSuccess) : IconFail}
            {step < 4
              ? "We're getting everything ready for you."
              : "everything is ready."}
          </li>
        </ul>
      </div>
    );
  }

  // timestampe page
  return (
    <div className="w-full bg-white h-screen">
      <div className="flex justify-end px-4 pt-4">
        <button
          id="dropdownButton"
          data-dropdown-toggle="dropdown"
          className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
          type="button"
        >
          <span className="sr-only">Open dropdown</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
        </button>

        <div
          id="dropdown"
          className="z-10 hidden text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
        >
          <ul className="py-2" aria-labelledby="dropdownButton">
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >
                Edit
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >
                Export Data
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >
                Delete
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <img
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          src={pictureUrl}
          alt="Bonnie image"
        />
        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
          {displayName}
        </h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {statusMessage}
        </span>

        <p className="mt-5 font-bold underline text-xl text-red-500">
          {textAnnounce}
        </p>

        <div className="flex mt-4 space-x-3 md:mt-6">
          <button
            onClick={() => handleWorkLeave()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 "
          >
            แจ้งลางาน
          </button>

          <button
            onClick={() => handleWorkIn()}
            className={
              (timestamp == ""
                ? "bg-blue-700 hover:bg-blue-800 focus:ring-blue-300"
                : timestamp == "workin"
                ? "bg-green-700 hover:bg-green-800 focus:ring-green-300"
                : "bg-gray-700 hover:bg-gray-800 focus:ring-gray-300 ") +
              (!shopIsOpen ? " cursor-not-allowed " : "") +
              " inline-flex items-center px-4 py-2 disabled:bg-gray-500 text-sm font-medium text-center text-white  rounded-lg  focus:ring-4 focus:outline-none"
            }
            disabled={
              !shopIsOpen ||
              timestamp == "workleave" ||
              timestamp == "workout" ||
              isFetching
            }
          >
            {isFetching ? (
              <div className="flex">
                {IconLoading} {" กำลังตอกบัตร..."}
              </div>
            ) : (
              textTimestamp
            )}
          </button>
        </div>
      </div>

      <footer className="bg-white ">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8 text-center">
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2023{" "}
            <a href="#" className="hover:underline">
              KSR Car Clean
            </a>
            . All Rights Reserved. {nickName}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
