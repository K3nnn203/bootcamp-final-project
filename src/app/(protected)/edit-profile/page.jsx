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
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import getConfig from "@/src/firebase/config";
import { toast } from "sonner";
import { Spinner } from "@/src/components/ui/spinner";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/src/components/ui/input-group";
import { SquarePen } from "lucide-react";

export default function EditProfile() {

  const { db } = getConfig();
  const  { user, loading } = useAuth();
  const router = useRouter();

  const [loadingUpdateProfile, setLoadingUpdateProfile] = useState(false)
  const [bioLength, setBioLength] = useState(0)
  const [image, setImage] = useState('');

  const fileInputRef = useRef(null)

  const handleChangeImage = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    const imageUrl = await uploadImage(file);
    setImage(imageUrl)
  }

  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "bootcamp_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/m7zce3e7/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      toast.error(err.message)
    }

  }

  const handleGoBack = () => {
    router.back();
  }

  const updateUserProfile = async (profileName, bio) => {
    const userRef = doc(db, 'users', user.userId)
    await updateDoc(userRef, {
      profileName: profileName,
      bio: bio,
      profilePic: image
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

  useEffect(() => {
    setBioLength(user?.bio.length)
  }, [user])

  if(loading) return <div className="flex justify-center"><Spinner /></div>

  return (
    <div>
      <form onSubmit={handleSaveChanges}>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Personalized your page.</FieldDescription>
          <FieldGroup>
            <div className="flex flex-col gap-5 items-center">
              <Avatar className="w-35 h-35">
                <AvatarImage src={image} alt="profile-picture" />
                <AvatarFallback>{user?.username[0]}</AvatarFallback>
                <AvatarBadge style={{width: 30, height: 30}} onClick={() => fileInputRef.current?.click()}>
                  <SquarePen style={{width: 20, height: 20}} />
                </AvatarBadge>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleChangeImage}
                />
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
              <InputGroup>
                <InputGroupTextarea 
                  id="bio" 
                  name="bio" 
                  placeholder="I love burgers..." 
                  defaultValue={user?.bio} 
                  onChange={(e) => setBioLength(e.target.value.length)}
                  maxLength={160} 
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText>{bioLength}/160</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
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
