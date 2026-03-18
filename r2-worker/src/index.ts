import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface Env {
  BUCKET: R2Bucket;
  BUCKET_NAME: string;
  ACCOUNT_ID: string;
  ACCESS_KEY_ID: string;
  SECRET_ACCESS_KEY: string;
  PUBLIC_URL: string;
  ADMIN_TOKEN: string; // Secret for deleting clips
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Generate Presigned URL for Upload
    if (url.pathname === "/presign" && request.method === "POST") {
      try {
        const { fileName, contentType, userId } = await request.json() as any;

        if (!fileName || !contentType) {
          return new Response("Missing params", { status: 400, headers: corsHeaders });
        }

        const s3 = new S3Client({
          region: "auto",
          endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: env.ACCESS_KEY_ID,
            secretAccessKey: env.SECRET_ACCESS_KEY,
          },
        });

        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: env.BUCKET_NAME,
            Key: fileName,
            ContentType: contentType,
            Metadata: { userId },
          }),
          { expiresIn: 300 } // 5 minutes
        );

        return new Response(JSON.stringify({
          uploadUrl,
          publicUrl: `${env.PUBLIC_URL}/${fileName}`,
          key: fileName
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    // 2. Delete Endpoint (Admin only)
    if (url.pathname === "/delete" && request.method === "POST") {
      try {
        const auth = request.headers.get("Authorization");
        if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
          return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        }

        const { key } = await request.json() as any;
        if (!key) {
          return new Response("Missing key", { status: 400, headers: corsHeaders });
        }
        
        await env.BUCKET.delete(key);
        return new Response("Deleted", { headers: corsHeaders });
      } catch (e: any) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
