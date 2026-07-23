"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import getConfig from "@/src/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import DatePicker from "@/src/components/custom/DatePicker";
import { Spinner } from "@/src/components/ui/spinner";
import BaseDialog from "@/src/components/custom/BaseDialog";

export default function Register() {
  const { db } = getConfig();

  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [userExist, setUserExist] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleDateChange = (date) => {
    setForm(prev => ({
      ...prev,
      dateOfBirth: date
    }))
    setErrors({
      ...errors,
      dateOfBirth: "",
    });
  }

  const checkIfUsernameExist = async () => {
    const q = query(
      collection(db, "users"),
      where("username", "==", form.username),
    );
    const querySnap = await getDocs(q);
    return !querySnap.empty;
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.username.trim().length <= 5)
      newErrors.username = "Username is must be longer than 5 characters.";
    if (!form.username) newErrors.username = "Username is required.";

    if (calculateAge(form.dateOfBirth) <= 16) newErrors.dateOfBirth = "You need to be 17 years old or older to create an account.";
    if(!form.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required.";

    if (!emailRegex.test(form.email))
      newErrors.email = "Please enter a valid email address.";
    if (!form.email) newErrors.email = "Email is required.";

    if (!form.password) newErrors.password = "Password is required.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Confirm password doesn't match password.";

    return newErrors;
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  }

  const handleRegister = () => {
    const validationError = validateForm();
    if (Object.keys(validationError).length > 0) {
      setErrors(validationError);
    } else {
      setErrors([]);
      const { db, auth } = getConfig();
      setLoading(true)
      createUserWithEmailAndPassword(auth, form.email, form.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await setDoc(doc(db, "users", user.uid), {
            username: form.username,
            dateOfBirth: form.dateOfBirth,
            email: form.email,
            role: "user",
          });
          window.alert("Registration Successful");
          router.push("/login");
        })
        .catch((error) => {
          window.alert(error.message);
        })
        .finally(() => {
          setLoading(false)
        });
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      const checkUsername = async () => {
        const isUserExist = await checkIfUsernameExist();
        setUserExist(isUserExist);
      };

      checkUsername();
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [form.username]);

  return (
    <div className={styles.page}>
      <Card className={"w-100"}>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create a username and enter your email to register your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Label htmlFor="username">Username</Label>
              {form.username.length > 5 && (
                <p
                  className={`text-xs ${userExist === true ? "text-red-500" : "text-green-400"}`}
                >
                  {userExist === true
                    ? "Username already taken"
                    : "Username available"}
                </p>
              )}
            </div>
            <Input
              type="text"
              name="username"
              id="username"
              onChange={handleChange}
            />
          </div>
          <div
            className={`text-red-500 text-xs mb-1 ${
              errors.username ? 'visible' : 'invisible'
            }`}
          >
            {errors.username || "error"}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <DatePicker id="dateOfBirth" value={form.dateOfBirth} onChange={handleDateChange} />
          </div>
          <div
            className={`text-red-500 text-xs mb-1 ${
              errors.dateOfBirth ? 'visible' : 'invisible'
            }`}
          >
            {errors.dateOfBirth || "error"}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              onChange={handleChange}
            />
          </div>
          <div
            className={`text-red-500 text-xs mb-1 ${
              errors.email ? 'visible' : 'invisible'
            }`}
          >
            {errors.email || "error"}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
            />
          </div>
          <div
            className={`text-red-500 text-xs mb-1 ${
              errors.password ? 'visible' : 'invisible'
            }`}
          >
            {errors.password || "error"}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              onChange={handleChange}
            />
          </div>
          <div
            className={`text-red-500 text-xs mb-1 ${
              errors.confirmPassword ? 'visible' : 'invisible'
            }`}
          >
            {errors.confirmPassword || "error"}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full">
            <Button className="mb-1.5" onClick={handleRegister}>
              {loading && <Spinner />}
              Register
            </Button>
            <p className="text-center">
              Already registered? Login{" "}
              <Link href={"/login"} className="text-blue-400">
                here
              </Link>
            </p>
          </div>
          <BaseDialog />
        </CardFooter>
      </Card>
    </div>
  );
}
