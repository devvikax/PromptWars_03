"use client"

import * as React from "react"
import { Dialog, DialogProps } from "./dialog"

export type ModalProps = DialogProps

export function Modal(props: ModalProps) {
  return <Dialog {...props} />
}
