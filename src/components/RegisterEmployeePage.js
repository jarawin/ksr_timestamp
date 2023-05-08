import React, { useEffect, useState } from "react";
import axios from "axios";
import liff from "@line/liff";

import { ImSpinner9 } from "react-icons/im";

function RegisterEmployeePage(props) {
  const [nickName, setNickName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const IconLoading = (
    <ImSpinner9 className="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
  );

  useEffect(() => {
    document.title = "Register Employee";
  }, []);

  const isReady = () => {
    if (nickName && firstName && lastName && phone && consent) {
      setReady(true);
    } else {
      setReady(false);
    }
  };

  const sendMsg = async (state) => {
    if (state) {
      await liff.sendMessages([
        {
          type: "text",
          text: `ลงทะเบียนพนักงาน (${nickName}) สำเร็จ`,
        },
      ]);
    } else {
      await liff.sendMessages([
        {
          type: "text",
          text: `ลงทะเบียนพนักงาน (${nickName}) ไม่สำเร็จ`,
        },
      ]);
    }

    window.location.reload();
  };

  useEffect(() => {
    isReady();
  }, [nickName, firstName, lastName, phone, consent]);

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Register");

    let param = `&userid=${props.userId}&nickname=${nickName}&firstname=${firstName}&lastname=${lastName}&phone=${phone}&lat=${props.location.lat}&lon=${props.location.lon}`;

    try {
      setIsLoading(true);
      const res = await axios.get(
        `${props.Url_base}?call=set-register${param}`
      );

      if (liff.isInClient()) {
        if (res.data.status == 200) {
          await sendMsg(true);
        } else {
          await sendMsg(false);
        }
      } else {
        alert("register success.");
      }
    } catch (err) {
      alert("register error.");
    }

    setIsLoading(false);
  };

  return (
    <form className="m-10">
      <h1 class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Employee registration
      </h1>
      <p class="mb-6 text-md font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
        Register employees to access the system.
      </p>

      <div className="grid gap-3 mb-6 mt-5 md:grid-cols-2">
        <div>
          <label
            for="first_name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Nick name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ja"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            for="first_name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            First name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Jarawin"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            for="last_name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Last name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Promsawat"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            for="phone"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Phone number
          </label>
          <input
            type="tel"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="0987652021"
            pattern="[0]{1}[0-9]{9}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-start mb-6 mt-10">
        <div className="flex items-center h-5">
          <input
            id="remember"
            type="checkbox"
            value={consent}
            onChange={(e) => setConsent(!consent)}
            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
            required
          />
        </div>
        <label
          for="remember"
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          I certify that the information provided is accurate and correct.
        </label>
      </div>
      <button
        type="submit"
        disabled={!ready || isLoading}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
        onClick={handleRegister}
      >
        {isLoading ? (
          <div className="flex mx-auto">
            {IconLoading} {" registering"}
          </div>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
}

export default RegisterEmployeePage;
