document.addEventListener("DOMContentLoaded", () => {
  const screens = {
    intro: document.getElementById("intro-screen"),
    compose: document.getElementById("compose-screen"),
    preview: document.getElementById("preview-screen"),
    published: document.getElementById("published-screen")
  };

  const startBtn = document.getElementById("start-btn");
  const headline = document.getElementById("headline");
  const body = document.getElementById("post-body");
  const hashtags = document.getElementById("hashtags");
  const previewBtn = document.getElementById("preview-btn");
  const editBtn = document.getElementById("edit-btn");
  const publishBtn = document.getElementById("publish-btn");
  const toggleImageBtn = document.getElementById("toggle-image-btn");
  const imagePlaceholder = document.getElementById("image-placeholder");
  const recommendationList = document.getElementById("recommendation-list");
  const wordCount = document.getElementById("word-count");
  const debugTools = document.getElementById("debug-tools");
  const downloadBtn = document.getElementById("download-data-btn");
  const resetBtn = document.getElementById("reset-btn");

  const sessionId = "rec-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const session = {
    sessionId,
    condition: "algorithmic_recommending",
    startedAt: null,
    publishedAt: null,
    imageSelected: false,
    initialDraft: null,
    finalDraft: null,
    recommendationsDisplayed: [],
    events: []
  };

  let imageSelected = false;
  let firstMeaningfulDraftCaptured = false;

  const recommendationCatalog = {
    personal: {
      id: "personal",
      label: "Personal perspective",
      text: "Posts that include personal experiences are currently receiving more engagement. Consider adding a personal perspective."
    },
    opening: {
      id: "opening",
      label: "Opening",
      text: "Consider making your opening line more attention-grabbing to help draw your audience in."
    },
    image: {
      id: "image",
      label: "Image",
      text: "Posts that include an image are currently receiving greater visibility. Consider adding one."
    },
    hashtags: {
      id: "hashtags",
      label: "Hashtags",
      text: "Adding 2–3 relevant hashtags may help your post reach a wider audience."
    },
    concise: {
      id: "concise",
      label: "Post length",
      text: "Shorter posts are currently associated with higher engagement. Consider reducing the length."
    },
    detail: {
      id: "detail",
      label: "More detail",
      text: "Consider adding more detail about your experience to help audiences connect with your post."
    },
    audience: {
      id: "audience",
      label: "Audience connection",
      text: "Posts that speak directly to the audience are currently performing better. Consider addressing your audience directly."
    },
    selfPresentation: {
      id: "self_presentation",
      label: "Self-presentation",
      text: "Consider sharing something that reflects who you are or what matters to you."
    }
  };

  function now() {
    return new Date().toISOString();
  }

  function log(type, detail = {}) {
    session.events.push({ type, timestamp: now(), ...detail });
    persist();
  }

  function persist() {
    localStorage.setItem("ac_recommending_session", JSON.stringify(session));
  }

  function showScreen(name) {
    Object.values(screens).forEach(screen => screen.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    log("screen_view", { screen: name });
  }

  function getDraft() {
    return {
      headline: headline.value.trim(),
      body: body.value.trim(),
      hashtags: hashtags.value.trim(),
      imageSelected
    };
  }

  function getWordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  function hasFirstPerson(text) {
    return /\b(i|i'm|i’ve|i've|me|my|mine|myself)\b/i.test(text);
  }

  function hasAudienceLanguage(text) {
    return /\b(you|your|everyone|friends|followers|community)\b/i.test(text);
  }

  function chooseRecommendations() {
    const draft = getDraft();
    const combined = (draft.headline + " " + draft.body).trim();
    const words = getWordCount(combined);
    const recs = [];

    if (!hasFirstPerson(combined)) recs.push(recommendationCatalog.personal);
    if (draft.headline.length < 25) recs.push(recommendationCatalog.opening);
    if (!draft.imageSelected) recs.push(recommendationCatalog.image);
    if (!draft.hashtags.includes("#")) recs.push(recommendationCatalog.hashtags);
    if (words > 120) recs.push(recommendationCatalog.concise);
    if (words > 0 && words < 45) recs.push(recommendationCatalog.detail);
    if (!hasAudienceLanguage(combined)) recs.push(recommendationCatalog.audience);
    if (combined.length > 0 && !hasFirstPerson(combined)) recs.push(recommendationCatalog.selfPresentation);

    const fallback = [
      recommendationCatalog.personal,
      recommendationCatalog.audience,
      recommendationCatalog.hashtags,
      recommendationCatalog.image
    ];

    const unique = [...new Map([...recs, ...fallback].map(r => [r.id, r])).values()];
    return unique.slice(0, 4);
  }

  function renderRecommendations(trigger = "draft_change") {
    const recs = chooseRecommendations();
    recommendationList.innerHTML = "";

    recs.forEach(rec => {
      const item = document.createElement("div");
      item.className = "rec-item";
      item.innerHTML = "<strong>" + rec.label + "</strong><p>" + rec.text + "</p>";
      recommendationList.appendChild(item);
    });

    const snapshot = {
      timestamp: now(),
      trigger,
      recommendationIds: recs.map(r => r.id),
      draft: getDraft()
    };

    session.recommendationsDisplayed.push(snapshot);
    log("recommendations_displayed", {
      trigger,
      recommendationIds: snapshot.recommendationIds
    });
  }

  function updateComposer() {
    const combined = (headline.value + " " + body.value).trim();
    const count = getWordCount(combined);
    wordCount.textContent = count + (count === 1 ? " word" : " words");
    previewBtn.disabled = body.value.trim().length < 10;

    if (!firstMeaningfulDraftCaptured && combined.length >= 20) {
      session.initialDraft = getDraft();
      firstMeaningfulDraftCaptured = true;
      log("initial_draft_captured", { draft: session.initialDraft });
    }

    renderRecommendations("draft_change");
    log("draft_changed", { wordCount: count });
  }

  function renderPreview() {
    const draft = getDraft();
    document.getElementById("preview-headline").textContent = draft.headline || "My Post";
    document.getElementById("preview-body").textContent = draft.body;
    document.getElementById("preview-hashtags").textContent = draft.hashtags;
    document.getElementById("preview-image").classList.toggle("hidden", !draft.imageSelected);
    log("preview_opened", { draft });
  }

  startBtn.addEventListener("click", () => {
    session.startedAt = now();
    log("task_started");
    showScreen("compose");
    renderRecommendations("task_start");
  });

  [headline, body, hashtags].forEach(el => {
    el.addEventListener("input", updateComposer);
  });

  toggleImageBtn.addEventListener("click", () => {
    imageSelected = !imageSelected;
    session.imageSelected = imageSelected;
    imagePlaceholder.classList.toggle("hidden", !imageSelected);
    toggleImageBtn.textContent = imageSelected ? "Remove Image" : "Add Image";
    log("image_toggled", { selected: imageSelected });
    renderRecommendations("image_change");
  });

  previewBtn.addEventListener("click", () => {
    renderPreview();
    showScreen("preview");
  });

  editBtn.addEventListener("click", () => {
    log("returned_to_edit");
    showScreen("compose");
    renderRecommendations("return_from_preview");
  });

  publishBtn.addEventListener("click", () => {
    session.finalDraft = getDraft();
    session.publishedAt = now();
    log("post_published", {
      finalDraft: session.finalDraft,
      finalWordCount: getWordCount((session.finalDraft.headline + " " + session.finalDraft.body).trim())
    });
    persist();
    showScreen("published");
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("debug") === "1") {
    debugTools.classList.remove("hidden");
  }

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = session.sessionId + ".json";
    anchor.click();
    URL.revokeObjectURL(url);
    log("debug_export");
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem("ac_recommending_session");
    location.reload();
  });

  persist();
});
