import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import { db } from "@/lib/db";
import { Media } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Get media detail by ID
    const media = await db.media.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    // Delete from Cloudinary
    await syncDeleteMedia(media as Media);
   
    // Delete from database
    const res = await db.media.delete({
      where: {
        id: parseInt(id),
      },
    });

    // Return success message
    return NextResponse.json(res);
  } catch (error) {
    console.log("Error deleting media:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Extract public ID and delete from Cloudinary
const syncDeleteMedia = async (media: Media) => {
  const url = media.url;

  // Extract public ID from the URL
  const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const publicId = match[1];
    try {
      // Delete file from Cloudinary using the public ID
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary delete result:", result);
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      throw new Error("Cloudinary deletion failed");
    }
  } else {
    console.log("Invalid URL format for Cloudinary public ID extraction.");
    throw new Error("Invalid Cloudinary URL format");
  }
};
