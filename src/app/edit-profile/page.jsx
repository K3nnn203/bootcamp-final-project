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
import React from "react";
import { Textarea } from "@/src/components/ui/textarea";

export default function EditProfile() {
  return (
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
              @Kentfaj
            </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" />
          <FieldDescription>
            This is your display name
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="username">Bio</FieldLabel>
          <Textarea id="username" />
          <FieldDescription>Share something about yourself</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
