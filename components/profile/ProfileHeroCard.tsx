"use client";

import { CheckCircle2, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeroCardProps {
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  image?: string | null;
}

export default function ProfileHeroCard({
  name,
  email,
  emailVerified,
  role,
  createdAt,
  image,
}: ProfileHeroCardProps) {
  return (
    <Card className="relative mx-auto w-full overflow-hidden rounded-3xl bg-white inset-ring-1 inset-ring-gray-200/60 shadow-sm border-0 pt-0">
      
      {/* Header Gradient */}
      <div className="relative h-40 sm:h-48 bg-linear-to-tr from-primary via-indigo-500 to-purple-600">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white_1px,transparent_1px)] bg-size-[16px_16px]" />
      </div>

      {/* Overlapping Avatar */}
      <div className="relative z-10 flex justify-center -mt-16 sm:-mt-20">
        <div className="rounded-full p-1.5 bg-white shadow-xl inset-ring-1 inset-ring-gray-100">
          <Avatar className="size-32 sm:size-36 bg-gray-50">
            <AvatarImage src={image ?? "/RKLibrary/owner2.jpeg"} alt={name} className="object-cover" />
            <AvatarFallback className="flex items-center justify-center text-4xl font-bold text-primary bg-primary/5">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <CardContent className="pt-6 px-4 sm:px-8 text-center space-y-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 text-balance">
            {name}
          </h2>
          <p className="mt-1.5 flex items-center justify-center gap-2 text-sm sm:text-base text-gray-500 font-medium">
            <Mail className="size-4 text-gray-400" />
            {email}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm pt-2">
          {emailVerified && (
            <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/50 rounded-full px-3 py-1">
              <CheckCircle2 className="size-4" />
              Email Verified
            </Badge>
          )}

          <Badge variant="outline" className="rounded-full px-3 py-1 text-gray-500 inset-ring-gray-200 border-0">
            Joined {createdAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Badge>

          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-3 py-1 shadow-none">
            {role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}