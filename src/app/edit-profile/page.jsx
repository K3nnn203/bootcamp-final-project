'use client'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/src/components/ui/field";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/src/components/ui/textarea";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import getConfig from "@/src/firebase/config";
import { toast } from "sonner";
import { Spinner } from "@/src/components/ui/spinner";

export default function EditProfile() {

  const { db } = getConfig();
  const  { user, loading } = useAuthGuard();
  const router = useRouter();

  const [loadingUpdateProfile, setLoadingUpdateProfile] = useState(false)

  const handleGoBack = () => {
    router.back();
  }

  const updateUserProfile = async (profileName, bio) => {
    const userRef = doc(db, 'users', user.userId)
    await updateDoc(userRef, {
      profileName: profileName,
      bio: bio
    })
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profileName = formData.get('profile-name')
    const bio = formData.get('bio')
    setLoadingUpdateProfile(true)
    try {
      await updateUserProfile(profileName, bio)
      toast.success('Your profile has been updated')
    } catch {
      toast.error('Something went wrong, try again later')
    } finally {
      setLoadingUpdateProfile(false)
    }
  }

  if(loading) return <div>loading...</div>

  return (
    <div>
      <form onSubmit={handleSaveChanges}>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Personalized your page.</FieldDescription>
          <FieldGroup>
            <div className="flex flex-col gap-5 items-center">
              <Avatar className="w-35 h-35">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                  @{user?.username}
                </p>
            </div>
            <Field>
              <FieldLabel htmlFor="profile-name">Name</FieldLabel>
              <Input id="profile-name" name="profile-name" defaultValue={user?.profileName} />
              <FieldDescription>
                This is your display name
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea id="bio" name="bio" placeholder="I love burgers..." defaultValue={user?.bio} />
              <FieldDescription>Share something about yourself</FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Button type="submit">
                {loadingUpdateProfile && <Spinner />}
                Save Changes
              </Button>
              <Button variant="outline" type="button" onClick={handleGoBack}>Back</Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
