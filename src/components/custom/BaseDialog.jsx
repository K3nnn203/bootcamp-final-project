import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

export default function BaseDialog(props) {
const {
    trigger,
    title,
    description,
    withFooter = false,
    footerContent,
} = props

  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        {
            withFooter && <DialogFooter>
                {footerContent}
            </DialogFooter>
        }
      </DialogContent>
    </Dialog>
  );
}
