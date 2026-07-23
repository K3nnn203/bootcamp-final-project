"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import getConfig from "@/src/firebase/config";
import { doc, getDoc } from "firebase/firestore";
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
import { toast } from "sonner";
import { Spinner } from "@/src/components/ui/spinner";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required.";
    if (!form.password) newErrors.password = "Password is required.";

    return newErrors;
  };

  const handleLogin = () => {
    const validationError = validateForm();
    if (Object.keys(validationError).length > 0) {
      setErrors(validationError);
    } else {
      setErrors([]);
      const { db, auth } = getConfig();
      setLoading(true)
      signInWithEmailAndPassword(auth, form.email, form.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const userData = await getDoc(doc(db, "users", user.uid));
          toast.success("Login successful.", {position: 'bottom-right'})
          router.push("/");
        })
        .catch((error) => {
          window.alert(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className={styles.page}>
      <Card className='w-100'>
        <CardHeader>
          <CardTitle>
            Sign in
          </CardTitle>
          <CardDescription>Enter your email and password to login</CardDescription>
        </CardHeader>
        <CardContent>
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
            className={`${styles.error} ${
              errors.email ? styles.visible : styles.hidden
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
            className={`${styles.error} ${
              errors.password ? styles.visible : styles.hidden
            }`}
          >
            {errors.password || "error"}
          </div>
        </CardContent>
        <CardFooter>
          <div className='flex flex-col w-full'>
            <Link href={""} className="text-right text-blue-400">
              Forgot password?
            </Link>
            <Button className="mt-1.5 mb-1.5" onClick={handleLogin}>
              {loading && <Spinner />}
              Login
            </Button>
            <p className="text-center">
              Not registered yet? Sign up <Link href={"/register"} className="text-blue-400">here</Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
