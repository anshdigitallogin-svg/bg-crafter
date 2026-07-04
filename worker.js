import { removeBackground } from "@imgly/background-removal";

self.onmessage = async (e) => {
  const file = e.data;

  try {
    const blob = await removeBackground(file);

    self.postMessage({
      success: true,
      blob: blob
    });

  } catch (err) {
    self.postMessage({
      success: false,
      error: err.message
    });
  }
};