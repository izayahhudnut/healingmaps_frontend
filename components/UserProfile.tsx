"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Pencil, Loader2, Upload } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  name: string | null; // Allow null for name
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfile({ user: initialUser }: { user: UserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialUser.image);
  const [user, setUser] = useState(initialUser);
  const { toast } = useToast();
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", user.id);

      setIsLoading(true);
      const response = await axios.post("/api/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImagePreview(response.data.url);
      setUser({ ...user, image: response.data.url });

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(`/api/users/${user.id}`, user);
      setUser(response.data);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {user.role === "PROVIDER" ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || ""} />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Label
                    htmlFor="image-upload"
                    className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </Label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { label: "First Name", key: "firstName" },
                  { label: "Last Name", key: "lastName" },
                  { label: "Email", key: "email" },
                  { label: "Role", key: "role" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {label}
                    </Label>
                    {isEditing && key !== "role" ? (
                      <Input
                        value={user[key as keyof UserData] || ""}
                        onChange={(e) =>
                          setUser({ ...user, [key]: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="font-medium">
                        {user[key as keyof UserData] || "N/A"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setUser(initialUser);
                      setImagePreview(initialUser.image);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || ""} />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Label
                    htmlFor="image-upload"
                    className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </Label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { label: "Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Role", key: "role" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {label}
                    </Label>
                    {isEditing && key !== "role" ? (
                      <Input
                        value={user[key as keyof UserData] || ""}
                        onChange={(e) =>
                          setUser({ ...user, [key]: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="font-medium">
                        {user[key as keyof UserData] || "N/A"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setUser(initialUser);
                      setImagePreview(initialUser.image);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
