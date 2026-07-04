// ==========================
// WEB WORKER
// ==========================

const worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
});

// ==========================
// ELEMENTS
// ==========================

const imageInput = document.getElementById("imageInput");
const browseBtn = document.getElementById("browseBtn");

const dropArea = document.getElementById("dropArea");

const previewWrapper = document.getElementById("previewWrapper");
const previewImage = document.getElementById("previewImage");

const clearImageBtn = document.getElementById("clearImageBtn");

const uploadText = document.getElementById("uploadText");
const uploadCount = document.getElementById("uploadCount");

const imageInfo = document.getElementById("imageInfo");
const infoName = document.getElementById("infoName");
const infoSize = document.getElementById("infoSize");
const infoResolution = document.getElementById("infoResolution");
const infoFormat = document.getElementById("infoFormat");

const removeBtn = document.getElementById("removeBtn");

const loader = document.getElementById("loader");
const loaderText = loader.querySelector("p");

const resultBox = document.getElementById("resultBox");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");

const toast = document.getElementById("toast");

removeBtn.style.display = "none";
resultBox.style.display = "none";

// ==========================
// VARIABLES
// ==========================

let selectedFile = null;
let resultUrl = null;

// ==========================
// OPEN FILE PICKER
// ==========================

browseBtn.addEventListener("click", () => {

    imageInput.value = "";
    imageInput.click();

});

// ==========================
// IMAGE SELECT
// ==========================

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
    }

    selectedFile = file;

    showPreview(file);

});

// ==========================
// PREVIEW
// ==========================

function showPreview(file) {

    const reader = new FileReader();

    reader.onload = (e) => {

        previewImage.src = e.target.result;

        previewWrapper.style.display = "block";

        uploadText.style.display = "none";

        const img = new Image();

img.onload = () => {

    infoName.textContent = file.name;

    infoSize.textContent =
        (file.size / 1024 / 1024).toFixed(2) + " MB";

    infoResolution.textContent =
        `${img.width} × ${img.height}`;

    infoFormat.textContent =
        file.type.replace("image/", "").toUpperCase();

    imageInfo.style.display = "block";

};

img.src = e.target.result;

        removeBtn.style.display = "block";
resultBox.style.display = "none";

        if (uploadCount) {
    uploadCount.textContent = "1 Image Selected";
}

    };

    reader.readAsDataURL(file);

}

// ==========================
// CLEAR IMAGE
// ==========================

clearImageBtn.addEventListener("click", () => {

    imageInput.value = "";

    selectedFile = null;

    previewImage.src = "";

    previewWrapper.style.display = "none";

    uploadText.style.display = "block";

    imageInfo.style.display = "none";

    if (uploadCount) {
    uploadCount.textContent = "";
}

removeBtn.style.display = "none";
    resultBox.style.display = "none";

    if (resultUrl) {

        URL.revokeObjectURL(resultUrl);

        resultUrl = null;

    }

});

// ==========================
// DRAG & DROP
// ==========================

dropArea.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropArea.classList.add("dragover");

});

dropArea.addEventListener("dragleave", () => {

    dropArea.classList.remove("dragover");

});

dropArea.addEventListener("drop", (e) => {

    e.preventDefault();

    dropArea.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    selectedFile = file;

    showPreview(file);

});

// ==========================
// REMOVE BACKGROUND
// ==========================

removeBtn.addEventListener("click", () => {

    if (!selectedFile) {

        alert("Please upload an image first.");

        return;

    }

    loader.style.display = "block";

    removeBtn.disabled = true;

    // Progress Elements
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");
    const progressText = document.getElementById("progressText");

    let progress = 0;

    const messages = [
        "Uploading Image...",
        "Loading AI Model...",
        "Removing Background...",
        "Refining Edges...",
        "Finalizing Image..."
    ];

    progressFill.style.width = "0%";
    progressPercent.textContent = "0%";
    progressText.textContent = messages[0];

    const progressInterval = setInterval(() => {

        if (progress >= 95) {

            clearInterval(progressInterval);
            return;

        }

        progress += Math.floor(Math.random() * 6) + 2;

        if (progress > 95) progress = 95;

        progressFill.style.width = progress + "%";
        progressPercent.textContent = progress + "%";

        if (progress < 20)
            progressText.textContent = messages[0];
        else if (progress < 40)
            progressText.textContent = messages[1];
        else if (progress < 70)
            progressText.textContent = messages[2];
        else if (progress < 90)
            progressText.textContent = messages[3];
        else
            progressText.textContent = messages[4];

    }, 700);

    // Save interval globally
    window.progressInterval = progressInterval;

    worker.postMessage(selectedFile);

});

// ==========================
// WORKER RESPONSE
// ==========================

worker.onmessage = (e) => {

    // Progress Complete
    clearInterval(window.progressInterval);

    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");
    const progressText = document.getElementById("progressText");

    progressFill.style.width = "100%";
    progressPercent.textContent = "100%";
    progressText.textContent = "✅ Background Removed Successfully!";

    const data = e.data;

    if (!data.success) {

        loader.style.display = "none";
        removeBtn.disabled = false;

        console.error(data.error);
        alert("Background removal failed.");

        return;

    }

    if (resultUrl) {

        URL.revokeObjectURL(resultUrl);

    }

    resultUrl = URL.createObjectURL(data.blob);

    resultImage.src = resultUrl;

    downloadBtn.href = resultUrl;

    // Result dikhane se pehle thoda delay
    setTimeout(() => {

        loader.style.display = "none";

        removeBtn.disabled = false;

        resultBox.style.display = "block";

        showToast("✅ Background removed successfully!");

    }, 700);

};

// ==========================
// WORKER ERROR
// ==========================

worker.onerror = (error) => {

    loader.style.display = "none";
    removeBtn.disabled = false;

    console.error("Worker Error:", error);

    alert("Worker Error. Check Console.");

};

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

// ================= FAQ =================

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        // Sirf ek FAQ open rahe
        faqItems.forEach((otherItem) => {

            if (otherItem !== item) {
                otherItem.classList.remove("active");
            }

        });

        // Current FAQ toggle
        item.classList.toggle("active");

    });

});