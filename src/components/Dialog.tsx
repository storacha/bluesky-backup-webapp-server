"use client";

import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { Fragment } from "react";
import Button from "./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
}: DialogProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog 
        as="div" 
        className="relative z-50" 
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel className={`w-full ${sizeClasses[size]} rounded-xl bg-white p-6 shadow-xl relative`}>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close dialog"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}

              {/* Title */}
              {title && (
                <HeadlessDialog.Title as="h3" className="text-lg font-bold mb-2">
                  {title}
                </HeadlessDialog.Title>
              )}

              {/* Description */}
              {description && (
                <HeadlessDialog.Description className="text-sm text-gray-500 mb-4">
                  {description}
                </HeadlessDialog.Description>
              )}

              {/* Content */}
              <div className="mt-2">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="mt-6 flex justify-end space-x-2">
                  {footer}
                </div>
              )}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

// Convenience components for standard dialog actions
export function DialogActions({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode,
  className?: string 
}) {
  return (
    <div className={`mt-6 flex justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}

export function DialogCloseButton({ 
  onClick, 
  children = "Cancel" 
}: { 
  onClick: () => void,
  children?: React.ReactNode 
}) {
  return (
    <Button variant="secondary" onClick={onClick}>
      {children}
    </Button>
  );
}

export function DialogConfirmButton({ 
  onClick, 
  children = "Confirm",
  isLoading = false,
  disabled = false,
}: { 
  onClick: () => void,
  children?: React.ReactNode,
  isLoading?: boolean,
  disabled?: boolean,
}) {
  return (
    <Button 
      variant="primary" 
      onClick={onClick} 
      isLoading={isLoading}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
