type ModerationInput =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

const warningMessage =
  "Please revise this before submitting. Tips With T does not allow vulgar, sexual, hateful, threatening, graphic, self-harm, or unsafe content.";

const localTextWarning =
  "Please revise this before submitting. Tips With T does not allow vulgar, sexual, hateful, threatening, graphic, self-harm, or unsafe content.";

const maxModerationTextChars = 4000;

function getTextFromInput(input: ModerationInput) {
  if (typeof input === "string") {
    return input;
  }

  return input
    .filter((item) => item.type === "text")
    .map((item) => ("text" in item ? item.text : ""))
    .join(" ");
}

function trimModerationText(value: string) {
  return value.slice(0, maxModerationTextChars);
}

function normalizeModerationInput(input: ModerationInput): ModerationInput {
  if (typeof input === "string") {
    return trimModerationText(input);
  }

  return input.map((item) => {
    if (item.type === "text") {
      return {
        type: "text",
        text: trimModerationText(item.text),
      };
    }

    return item;
  });
}

function hasImageInput(input: ModerationInput) {
  return Array.isArray(input) && input.some((item) => item.type === "image_url");
}

function localTextSafetyCheck(input: ModerationInput) {
  const text = getTextFromInput(input).toLowerCase();

  const unsafePatterns = [
    /\b(kill|murder|rape|suicide|self[-\s]?harm)\b/i,
    /\b(nude|nudes|porn|explicit|sexual)\b/i,
    /\b(fuck|shit|bitch|asshole|dick|pussy)\b/i,
    /\b(threat|threaten|stab|shoot|weapon)\b/i,
  ];

  const flagged = unsafePatterns.some((pattern) => pattern.test(text));

  return {
    allowed: !flagged,
    skipped: true,
    warning: flagged ? localTextWarning : "",
    categories: flagged ? ["local_text_filter"] : [],
  };
}

function getFlaggedCategories(result: any) {
  const categories = result?.results?.[0]?.categories || {};

  return Object.keys(categories).filter((key) => categories[key] === true);
}

export async function moderateContent(input: ModerationInput) {
  const normalizedInput = normalizeModerationInput(input);
  const localCheck = localTextSafetyCheck(normalizedInput);

  if (!localCheck.allowed) {
    return {
      ...localCheck,
      skipped: false,
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  if (!openAiKey) {
    if (!hasImageInput(normalizedInput)) {
      return {
        allowed: true,
        skipped: true,
        warning: "",
        categories: [],
      };
    }

    return {
      allowed: false,
      skipped: true,
      warning:
        "Image safety is not configured yet. Please try again later.",
      categories: [],
    };
  }

  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: normalizedInput,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const openAiMessage =
      result?.error?.message ||
      result?.message ||
      "OpenAI could not complete the safety check.";

    const isRateLimited =
      response.status === 429 ||
      openAiMessage.toLowerCase().includes("too many requests");

    if (isRateLimited && !hasImageInput(normalizedInput)) {
      return localCheck;
    }

    return {
      allowed: false,
      skipped: false,
      warning: `Could not check this content for safety. OpenAI said: ${openAiMessage}`,
      categories: [],
    };
  }

  const flagged = result?.results?.[0]?.flagged === true;

  return {
    allowed: !flagged,
    skipped: false,
    warning: flagged ? warningMessage : "",
    categories: getFlaggedCategories(result),
  };
}

export async function fileToDataUrl(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || "image/jpeg";

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
