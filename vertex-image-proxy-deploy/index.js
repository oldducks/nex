const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.json({ limit: "30mb" }));

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "nexsolution";

const DEFAULT_IMAGE_REGION = process.env.VERTEX_REGION || "asia-southeast1";
const DEFAULT_IMAGE_MODEL = process.env.VERTEX_IMAGE_MODEL || "imagen-3.0-generate-002";
const DEFAULT_IMAGE_EDIT_MODEL =
  process.env.VERTEX_IMAGE_EDIT_MODEL || "gemini-2.5-flash-image";
const DEFAULT_IMAGE_EDIT_REGION =
  process.env.VERTEX_IMAGE_EDIT_REGION || "asia-southeast1";

const VIDEO_REGION =
  process.env.VERTEX_VIDEO_REGION || process.env.VERTEX_REGION || "us-central1";
const VIDEO_MODEL =
  process.env.VERTEX_VIDEO_MODEL || "veo-3.1-generate-preview";
const VIDEO_MAX_POLL_MS = Number(process.env.VIDEO_MAX_POLL_MS || 240000);
const VIDEO_POLL_INTERVAL_MS = Number(
  process.env.VIDEO_POLL_INTERVAL_MS || 5000
);

const PROXY_SECRET = process.env.NEX_VERTEX_PROXY_SECRET || "";
const PROXY_SECRET_HEADER = "X-NEX-PROXY-SECRET";

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

function requireProxySecret(req, res) {
  if (!PROXY_SECRET) {
    console.warn(
      "Cloud Run proxy secret protection disabled: NEX_VERTEX_PROXY_SECRET is not set"
    );
    return true;
  }

  const incomingSecret = req.header(PROXY_SECRET_HEADER);
  if (!incomingSecret || incomingSecret !== PROXY_SECRET) {
    console.warn("Unauthorized request blocked");
    res.status(401).json({
      ok: false,
      error: "Unauthorized",
    });
    return false;
  }

  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAccessTokenOrThrow() {
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken =
    typeof accessTokenResponse === "string"
      ? accessTokenResponse
      : accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error("Could not obtain Google access token");
  }

  return accessToken;
}

function pickImageBase64(prediction) {
  if (!prediction) return null;
  // Imagen style
  const bytes = (
    prediction?.bytesBase64Encoded ||
    prediction?.image?.bytesBase64Encoded ||
    prediction?.image?.data ||
    prediction?.data
  );
  if (bytes) return bytes;

  // Gemini style
  if (prediction?.parts) {
    const imagePart = prediction.parts.find(p => p.inlineData && p.inlineData.data);
    if (imagePart) return imagePart.inlineData.data;
  }

  return null;
}

function pickVideoBase64(video) {
  return (
    video?.bytesBase64Encoded ||
    video?.video?.bytesBase64Encoded ||
    video?.bytesBase64 ||
    video?.videoBytesBase64 ||
    null
  );
}

function sanitizeMimeType(value, fallback = "image/png") {
  const mimeType = typeof value === "string" ? value.trim().toLowerCase() : "";
  return mimeType === "image/jpeg" || mimeType === "image/png" ? mimeType : fallback;
}

function buildVertexImageUrl(region, model) {
  const normalizedRegion = String(region || "").trim().toLowerCase();
  const host =
    normalizedRegion === "global"
      ? "aiplatform.googleapis.com"
      : `${normalizedRegion}-aiplatform.googleapis.com`;
  
  if (model.includes("gemini")) {
    return `https://${host}/v1/projects/${PROJECT_ID}/locations/${region}/publishers/google/models/${model}:generateContent`;
  }
  return `https://${host}/v1/projects/${PROJECT_ID}/locations/${region}/publishers/google/models/${model}:predict`;
}

function normalizeImageModel(model) {
  const normalized = String(model || "").trim();
  if (!normalized) return "";
  return normalized;
}

function resolveImageRegion(requestedRegion, isEdit) {
  const normalized = typeof requestedRegion === "string" ? requestedRegion.trim() : "";
  if (!normalized) {
    return isEdit ? DEFAULT_IMAGE_EDIT_REGION : DEFAULT_IMAGE_REGION;
  }

  if (normalized === "global") {
    return isEdit ? DEFAULT_IMAGE_EDIT_REGION : DEFAULT_IMAGE_REGION;
  }

  return normalized;
}

async function readResponsePayload(response) {
  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!rawText) {
    return { parsed: null, rawText: "", contentType };
  }

  try {
    return {
      parsed: JSON.parse(rawText),
      rawText,
      contentType,
    };
  } catch {
    return {
      parsed: null,
      rawText,
      contentType,
    };
  }
}

function summarizeRawText(rawText, maxLength = 400) {
  if (typeof rawText !== "string" || !rawText) return "";
  return rawText.replace(/\s+/g, " ").slice(0, maxLength);
}

function isImageEditRequest(body) {
  return Boolean(
    body?.baseImage ||
      body?.referenceImage ||
      body?.productImage ||
      (Array.isArray(body?.referenceImages) && body.referenceImages.length > 0) ||
      body?.editMode
  );
}

function summarizeImageRequest(body, region, model, isEdit) {
  return {
    region,
    model,
    isEdit,
    editMode: typeof body?.editMode === "string" ? body.editMode : "prompt-only",
    aspectRatio: body?.aspectRatio || "1:1",
    sampleCount: Number(body?.sampleCount) || 1,
    hasBaseImage: Boolean(body?.baseImage),
    hasReferenceImage: Boolean(body?.referenceImage),
    hasProductImage: Boolean(body?.productImage),
    referenceImagesCount: Array.isArray(body?.referenceImages)
      ? body.referenceImages.length
      : 0,
    promptLength: typeof body?.prompt === "string" ? body.prompt.length : 0,
  };
}

function toVertexImage(image, fallbackMimeType = "image/png") {
  if (!image || typeof image !== "object") {
    return null;
  }

  const bytesBase64Encoded =
    typeof image.bytesBase64Encoded === "string"
      ? image.bytesBase64Encoded
      : typeof image.data === "string"
        ? image.data
        : null;

  if (!bytesBase64Encoded) {
    return null;
  }

  return {
    mimeType: sanitizeMimeType(image.mimeType, fallbackMimeType),
    bytesBase64Encoded,
  };
}

function buildPromptOnlyImageRequest(body) {
  const prompt = body?.prompt;
  if (!prompt || typeof prompt !== "string") {
    return { error: "prompt is required and must be a string" };
  }

  return {
    instances: [
      {
        prompt,
      },
    ],
    parameters: {
      sampleCount: Number(body?.sampleCount) || 1,
      aspectRatio: body?.aspectRatio || "1:1",
      personGeneration: body?.personGeneration || "allow_adult",
      safetyFilterLevel: body?.safetyFilterLevel || "block_some",
      enhancePrompt:
        typeof body?.enhancePrompt === "boolean" ? body.enhancePrompt : true,
    },
  };
}

function buildGeminiImageRequest(body) {
  const prompt = body?.prompt;
  if (!prompt || typeof prompt !== "string") {
    return { error: "prompt is required and must be a string" };
  }

  const parts = [{ text: prompt }];

  // Add images as parts
  const imagesToAttach = [];
  if (body?.baseImage) imagesToAttach.push(body.baseImage);
  if (body?.referenceImage) imagesToAttach.push(body.referenceImage);
  if (body?.productImage) imagesToAttach.push(body.productImage);
  if (Array.isArray(body?.referenceImages)) {
    body.referenceImages.forEach(img => imagesToAttach.push(img));
  }

  for (const img of imagesToAttach) {
    const vertexImg = toVertexImage(img);
    if (vertexImg) {
      parts.push({
        inlineData: {
          mimeType: vertexImg.mimeType,
          data: vertexImg.bytesBase64Encoded
        }
      });
    }
  }

  const aspectRatio = typeof body?.aspectRatio === "string" ? body.aspectRatio.trim() : "";
  const generationConfig = {
    responseModalities: ["IMAGE"],
  };

  if (aspectRatio) {
    generationConfig.imageConfig = {
      aspectRatio,
    };
  }

  return {
    contents: [
      {
        role: "user",
        parts: parts
      }
    ],
    generationConfig,
  };
}

function buildEditImageRequest(body) {
  const prompt = body?.prompt;
  if (!prompt || typeof prompt !== "string") {
    return { error: "prompt is required and must be a string" };
  }

  const baseImage = toVertexImage(body?.baseImage);
  const directReferenceImage = toVertexImage(body?.referenceImage);
  const legacyProductImage = toVertexImage(body?.productImage);
  const providedReferences = Array.isArray(body?.referenceImages)
    ? body.referenceImages.map((item) => toVertexImage(item)).filter(Boolean)
    : [];

  const productReferences = [];
  if (directReferenceImage) productReferences.push(directReferenceImage);
  if (legacyProductImage) productReferences.push(legacyProductImage);
  for (const item of providedReferences) {
    productReferences.push(item);
  }

  const requiresProductReplace = body?.editMode === "product-replace";
  if (requiresProductReplace && (!baseImage || productReferences.length === 0)) {
    return {
      error:
        "product-replace requires baseImage (template) and referenceImage (product)",
    };
  }

  if (!baseImage && productReferences.length === 0) {
    return {
      error:
        "image edit requires at least baseImage or one reference image (referenceImage/productImage/referenceImages)",
    };
  }

  const dedupedProductReferences = [];
  const seen = new Set();
  for (const item of productReferences) {
    const key = `${item.mimeType}:${item.bytesBase64Encoded.slice(0, 48)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedProductReferences.push(item);
  }

  const referenceImages = [];
  let nextReferenceId = 1;

  // Base/template image should be marked as RAW reference for edit flows.
  if (baseImage) {
    referenceImages.push({
      referenceType: "REFERENCE_TYPE_RAW",
      referenceId: nextReferenceId++,
      referenceImage: baseImage,
    });
  }

  for (const image of dedupedProductReferences) {
    referenceImages.push({
      referenceType: "REFERENCE_TYPE_SUBJECT",
      referenceId: nextReferenceId++,
      referenceImage: image,
      subjectImageConfig: {
        subjectType: "SUBJECT_TYPE_PRODUCT",
        subjectDescription: "the uploaded product package",
      },
    });
  }

  if (body?.maskImage) {
    const maskImage = toVertexImage(body.maskImage);
    if (maskImage) {
      referenceImages.push({
        referenceType: "REFERENCE_TYPE_MASK",
        referenceId: nextReferenceId++,
        referenceImage: maskImage,
        maskImageConfig: {
          maskMode: "MASK_MODE_USER_PROVIDED",
          dilation: 0.03,
        },
      });
    }
  }

  const instance = {
    prompt,
    referenceImages,
  };

  const resolvedEditMode = "EDIT_MODE_INPAINT_INSERTION";

  return {
    instances: [instance],
    parameters: {
      sampleCount: requiresProductReplace
        ? Math.max(2, Number(body?.sampleCount) || 2)
        : Number(body?.sampleCount) || 1,
      aspectRatio: body?.aspectRatio || "1:1",
      personGeneration: body?.personGeneration || "allow_adult",
      safetyFilterLevel: body?.safetyFilterLevel || "block_some",
      editConfig: {
        editMode: resolvedEditMode,
      },
    },
  };
}


app.get("/", (req, res) => {
  res.send("Cloud Run working");
});

app.post("/generate-image", async (req, res) => {
  if (!requireProxySecret(req, res)) {
    return;
  }

  try {
    const body = req.body || {};
    const isEdit = isImageEditRequest(body);
    const requestedRegion = typeof body.location === "string" ? body.location.trim() : "";
    const requestedModel = normalizeImageModel(
      typeof body.model === "string" ? body.model.trim() : ""
    );
    const defaultModel = normalizeImageModel(isEdit ? DEFAULT_IMAGE_EDIT_MODEL : DEFAULT_IMAGE_MODEL);
    const model = requestedModel || defaultModel;
    const initialRegion = resolveImageRegion(requestedRegion, isEdit);
    const region = model.includes("gemini") ? "global" : initialRegion;

    const isGemini = model.includes("gemini");

    const requestBody = isGemini
      ? buildGeminiImageRequest(body)
      : (isEdit
          ? buildEditImageRequest(body)
          : buildPromptOnlyImageRequest(body));

    if (requestBody.error) {
      return res.status(400).json({
        ok: false,
        error: requestBody.error,
      });
    }

    console.log(
      "generate-image request",
      JSON.stringify({
        ...summarizeImageRequest(body, region, model, isEdit),
        requestedLocation: requestedRegion || null,
      })
    );

    if (isEdit) {
      const referenceTypes = Array.isArray(requestBody?.instances?.[0]?.referenceImages)
        ? requestBody.instances[0].referenceImages.map((item) => item?.referenceType || "unknown")
        : [];
      console.log(
        "generate-image mapping",
        JSON.stringify({
          region,
          model,
          referenceTypes,
          hasRawReference: referenceTypes.includes("REFERENCE_TYPE_RAW"),
          hasSubjectReference: referenceTypes.includes("REFERENCE_TYPE_SUBJECT"),
          hasMaskReference: referenceTypes.includes("REFERENCE_TYPE_MASK"),
        })
      );
    }

    const accessToken = await getAccessTokenOrThrow();
    const url = buildVertexImageUrl(region, model);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(requestBody),
    });

    const { parsed: data, rawText, contentType } = await readResponsePayload(response);

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "Vertex AI request failed",
        details: data || { rawText: summarizeRawText(rawText), contentType },
        forwarded: summarizeImageRequest(body, region, model, isEdit),
      });
    }

    const predictions = isGemini
      ? (data?.candidates?.[0]?.content ? [data.candidates[0].content] : [])
      : (Array.isArray(data?.predictions) ? data.predictions : []);

    const images = predictions
      .map((prediction, index) => {
        const bytesBase64Encoded = pickImageBase64(prediction);
        if (!bytesBase64Encoded) return null;

        return {
          index,
          mimeType:
            prediction?.mimeType || prediction?.image?.mimeType || "image/png",
          promptUsed: prediction?.prompt || body.prompt,
          bytesBase64Encoded,
        };
      })
      .filter(Boolean);

    if (images.length === 0) {
      console.warn("Vertex AI response did not include image bytes");
    }

    return res.json({
      ok: true,
      model,
      region,
      count: images.length,
      images,
      diagnostic:
        images.length === 0
          ? {
              vertexResponseKeys: Object.keys(data || {}),
              predictionCount: predictions.length,
              firstPredictionKeys:
                predictions.length > 0 && predictions[0]
                  ? Object.keys(predictions[0])
                  : [],
            }
          : undefined,
    });
  } catch (error) {
    console.error("generate-image error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Internal server error",
    });
  }
});

app.post("/generate-video", async (req, res) => {
  if (!requireProxySecret(req, res)) {
    return;
  }

  try {
    const {
      prompt,
      aspectRatio = "9:16",
      durationSeconds = 8,
      sampleCount = 1,
      personGeneration = "allow_adult",
      model = VIDEO_MODEL,
      referenceImage,
      image,
    } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        ok: false,
        error: "prompt is required and must be a string",
      });
    }

    const imgBase64 =
      referenceImage?.data || image?.bytesBase64Encoded || null;

    const imgMimeType =
      referenceImage?.mimeType || image?.mimeType || "image/png";

    if (!imgBase64 || typeof imgBase64 !== "string") {
      return res.status(400).json({
        ok: false,
        error:
          "reference image is required (referenceImage.data or image.bytesBase64Encoded)",
      });
    }

    const accessToken = await getAccessTokenOrThrow();

    const startUrl = `https://${VIDEO_REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VIDEO_REGION}/publishers/google/models/${model}:predictLongRunning`;

    const startBody = {
      instances: [
        {
          prompt,
          image: {
            bytesBase64Encoded: imgBase64,
            mimeType: imgMimeType,
          },
        },
      ],
      parameters: {
        aspectRatio: aspectRatio === "16:9" ? "16:9" : "9:16",
        durationSeconds: Number(durationSeconds) || 8,
        sampleCount: Number(sampleCount) || 1,
        personGeneration,
      },
    };

    const startResp = await fetch(startUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(startBody),
    });

    const { parsed: startData, rawText: startRawText, contentType: startContentType } = await readResponsePayload(startResp);

    if (!startResp.ok) {
      return res.status(startResp.status).json({
        ok: false,
        error: "Vertex Veo start failed",
        details: startData || { rawText: summarizeRawText(startRawText), contentType: startContentType },
      });
    }

    const operationName = startData?.name;
    if (!operationName) {
      return res.status(500).json({
        ok: false,
        error: "Veo did not return operation name",
      });
    }

    const pollUrl = `https://${VIDEO_REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VIDEO_REGION}/publishers/google/models/${model}:fetchPredictOperation`;

    const startedAt = Date.now();

    while (Date.now() - startedAt < VIDEO_MAX_POLL_MS) {
      await sleep(VIDEO_POLL_INTERVAL_MS);

      const pollResp = await fetch(pollUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ operationName }),
      });

      const { parsed: pollData, rawText: pollRawText, contentType: pollContentType } = await readResponsePayload(pollResp);

      if (!pollResp.ok) {
        return res.status(pollResp.status).json({
          ok: false,
          error: "Vertex Veo poll failed",
          details: pollData || { rawText: summarizeRawText(pollRawText), contentType: pollContentType },
        });
      }

      if (!pollData?.done) {
        continue;
      }

      if (pollData?.error) {
        return res.status(400).json({
          ok: false,
          error: "Vertex Veo failed",
          details: pollData.error,
        });
      }

      const firstVideo =
        pollData?.response?.videos?.[0] ||
        pollData?.response?.generateVideoResponse?.generatedSamples?.[0]
          ?.video ||
        null;

      const videoBase64 = pickVideoBase64(firstVideo);

      if (!videoBase64) {
        return res.status(400).json({
          ok: false,
          error: "Veo response did not include video bytes",
          details: {
            gcsUri: firstVideo?.gcsUri || null,
            responseKeys: Object.keys(pollData?.response || {}),
          },
        });
      }

      return res.json({
        ok: true,
        model,
        region: VIDEO_REGION,
        durationSeconds: Number(durationSeconds) || 8,
        aspectRatio: aspectRatio === "16:9" ? "16:9" : "9:16",
        video: {
          mimeType: firstVideo?.mimeType || "video/mp4",
          bytesBase64Encoded: videoBase64,
        },
      });
    }

    return res.status(504).json({
      ok: false,
      error: "Timed out waiting for Veo result",
      details: { operationName },
    });
  } catch (error) {
    console.error("generate-video error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Internal server error",
    });
  }
});

const port = process.env.PORT || 8080;

if (PROXY_SECRET) {
  console.log("Cloud Run proxy secret protection enabled");
} else {
  console.warn(
    "Cloud Run proxy secret protection disabled: NEX_VERTEX_PROXY_SECRET is not set"
  );
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
