"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMediaQuery } from "react-responsive";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAffiliate } from "@/hooks/use-affiliate";
import { ButtonSpinner } from "@/components/ui/button-spinner";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  image: string;
  slug: string;
};

export const AffiliateDialog = ({ isOpen, setIsOpen, title, image, slug }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [localSlug, setLocalSlug] = useState(slug);
  const [localTitle, setLocalTitle] = useState(title);
  const [localImage, setLocalImage] = useState(image);
  const [localImageBase64, setLocalImageBase64] = useState<string | null>(null);
  const [imgType, setImgType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useAffiliate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // check if the file is larger than 10mb
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File cannot be larger than 10mb");
      return;
    }

    // check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    // create blob url and set it to local image
    const blobUrl = URL.createObjectURL(file);
    setLocalImage(blobUrl);

    // conver the image to base64 for storage purposes
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result;
      setLocalImageBase64(base64Image as string);
      setImgType(file.type);
    };
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/affiliate/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: localTitle,
          image: localImageBase64,
          imgType,
          slug: localSlug,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      await mutate();
      toast.success("Referral link updated");
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLocalTitle(title);
    setLocalImage(image);
    setLocalSlug(slug);
    setLocalImageBase64(null);
    setImgType(null);
  }, [isOpen]);

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-left">Customize referral link</DrawerTitle>
            <DrawerDescription className="text-left">
              Customize how your referral link will look on X and other platforms.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="slug">Unique slug</Label>
              <Input
                id="slug"
                placeholder="Slug"
                value={localSlug}
                onChange={(e) => setLocalSlug(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Title"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Image</Label>
              <input
                hidden
                id="image"
                type="file"
                onChange={handleImageChange}
                ref={imgInputRef}
                accept="image/*"
              />
              <img
                src={localImage}
                alt="Referral image"
                className="aspect-[1200/630] cursor-pointer rounded-lg border object-cover transition-all hover:opacity-80"
                onClick={() => imgInputRef.current?.click()}
              />
              <p className="text-xs text-muted-foreground">
                We recommend an image size of 1200x630 pixels
              </p>
            </div>
            <DrawerFooter className="p-0">
              <Button
                disabled={
                  (localTitle === title && localImage === image && localSlug === slug) ||
                  isLoading ||
                  localSlug === ""
                }
                className="w-full"
                onClick={handleSave}
              >
                {isLoading ? <ButtonSpinner /> : "Save"}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Customize referral link</DialogTitle>
          <DialogDescription>
            Customize how your referral link will look on X and other platforms.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Unique slug</Label>
          <Input
            id="slug"
            placeholder="Slug"
            value={localSlug}
            onChange={(e) => setLocalSlug(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Title"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="image">Image</Label>
          <input
            hidden
            id="image"
            type="file"
            onChange={handleImageChange}
            ref={imgInputRef}
            accept="image/*"
          />
          <img
            src={localImage}
            alt="Referral image"
            className="aspect-[1200/630] cursor-pointer rounded-lg border object-cover transition-all hover:opacity-80"
            onClick={() => imgInputRef.current?.click()}
          />
          <p className="text-xs text-muted-foreground">
            We recommend an image size of 1200x630 pixels
          </p>
        </div>
        <DialogFooter>
          <Button size="sm" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={
              (localTitle === title && localImage === image && localSlug === slug) ||
              isLoading ||
              localSlug === ""
            }
            className="w-[52px]"
            onClick={handleSave}
          >
            {isLoading ? <ButtonSpinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
